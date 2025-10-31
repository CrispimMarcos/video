from rest_framework import serializers
from .models import Treinamento, Turma, Recurso, Aluno, Matricula


class RecursoSerializer(serializers.ModelSerializer):
    arquivo = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = ['id', 'turma', 'tipo_recurso', 'nome', 'descricao', 'url', 'arquivo', 'acesso_previo', 'draft']

    def get_arquivo(self, obj):
        request = self.context.get('request')
        if obj.arquivo:
            return request.build_absolute_uri(obj.arquivo.url)
        return None

    def create(self, validated_data):
        """
        Cria o recurso corretamente e salva o arquivo no MEDIA_ROOT.
        """
        # ⚙️ Cria o objeto do modelo, não do serializer!
        recurso = Recurso.objects.create(**validated_data)

        print("✅ Recurso criado com sucesso:", recurso)
        print("📂 Caminho do arquivo salvo:", recurso.arquivo.path if recurso.arquivo else "Nenhum arquivo")

        return recurso



class TurmaSerializer(serializers.ModelSerializer):
    treinamento = serializers.PrimaryKeyRelatedField(queryset=Treinamento.objects.all())
    recursos = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    alunos_matriculados = serializers.SerializerMethodField()
    alunos = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Turma
        fields = [
            'id',
            'nome',
            'data_inicio',
            'data_conclusao',
            'link_acesso',
            'treinamento',
            'recursos',
            'alunos',
            'alunos_matriculados',
            'criado_por',
        ]

    def get_alunos_matriculados(self, obj):
        alunos = Aluno.objects.filter(matriculas__turma=obj)
        return AlunoSerializer(alunos, many=True).data
        
    def create(self, validated_data):
        alunos_data = validated_data.pop('alunos', [])
        
        turma = Turma.objects.create(**validated_data)
        
        Matricula.objects.bulk_create([
            Matricula(turma=turma, aluno=aluno) for aluno in alunos_data
        ])
        
        return turma

    def update(self, instance, validated_data):
        alunos_data = validated_data.pop('alunos', None)
        
        # Atualiza os campos do modelo Turma (exceto 'alunos', que foi removido)
        instance = super().update(instance, validated_data)
        
        if alunos_data is not None:
            current_aluno_ids = set(instance.matriculas.values_list('aluno_id', flat=True))
            new_aluno_ids = set(aluno.id for aluno in alunos_data)

            alunos_to_remove = current_aluno_ids - new_aluno_ids
            Matricula.objects.filter(turma=instance, aluno_id__in=alunos_to_remove).delete()

            alunos_to_add = new_aluno_ids - current_aluno_ids
            Matricula.objects.bulk_create([
                Matricula(turma=instance, aluno_id=aluno_id) for aluno_id in alunos_to_add
            ])
            
        return instance


class TreinamentoSerializer(serializers.ModelSerializer):
    turmas = TurmaSerializer(many=True, read_only=True)

    class Meta:
        model = Treinamento
        fields = ['id', 'nome', 'descricao', 'turmas']


class AlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aluno
        fields = ["id", "nome", "email", "telefone", "is_staff", "is_superuser"]


class MatriculaSerializer(serializers.ModelSerializer):
    turma = TurmaSerializer(read_only=True)

    class Meta:
        model = Matricula
        fields = ['id', 'turma', 'data_matricula']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.BooleanField(default=False, required=False)

    class Meta:
        model = Aluno
        fields = ["id", "nome", "email", "telefone", "password", "is_superuser"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        is_superuser = validated_data.pop("is_superuser", False)
        print(validated_data)

        user = Aluno(**validated_data)
        user.set_password(password)

        if is_superuser:
            user.is_superuser = True
            user.is_staff = True

        user.save()
        return user