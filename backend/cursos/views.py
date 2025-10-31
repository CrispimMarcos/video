from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Aluno, Matricula, Treinamento, Turma, Recurso
from .serializers import (
    TreinamentoSerializer,
    RegisterSerializer,
    TurmaSerializer,
    RecursoSerializer,
    AlunoSerializer
)

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

# =========================================================
# 🔐 AUTENTICAÇÃO
# =========================================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user_data = RegisterSerializer(self.user).data
        data["user"] = user_data
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# =========================================================
# 👨‍🎓 TREINAMENTOS DO ALUNO
# =========================================================
class AlunoTreinamentosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            if request.user.id != pk:
                return Response(
                    {"detail": "Você não tem permissão para acessar estes treinamentos."},
                    status=403,
                )

            aluno = Aluno.objects.get(pk=pk)
        except Aluno.DoesNotExist:
            return Response({"detail": "Aluno não encontrado."}, status=404)

        matriculas = Matricula.objects.filter(aluno=aluno).select_related(
            "turma__treinamento"
        )

        treinamentos = []
        ids_treinamentos = set()
        for m in matriculas:
            t = m.turma.treinamento
            if t.id not in ids_treinamentos:
                ids_treinamentos.add(t.id)
                treinamentos.append(t)

        serializer = TreinamentoSerializer(treinamentos, many=True)
        return Response(serializer.data)


# =========================================================
# 👤 REGISTRO DE USUÁRIO
# =========================================================
class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Aluno.objects.all()
    serializer_class = RegisterSerializer


# =========================================================
# 📚 LISTAGENS GERAIS (Somente leitura)
# =========================================================
class TreinamentoListView(generics.ListAPIView):
    queryset = Treinamento.objects.all()
    serializer_class = TreinamentoSerializer
    permission_classes = [IsAuthenticated]


class TurmaListView(generics.ListAPIView):
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [IsAuthenticated]


class RecursoListView(generics.ListAPIView):
    serializer_class = RecursoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Recurso.objects.all()


# =========================================================
# ⚙️ ADMIN: CRUD COMPLETO PARA TREINAMENTO / TURMA / RECURSO
# =========================================================
class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite que apenas administradores criem, editem ou deletem."""

    def has_permission(self, request, view):
        # Leitura é liberada para qualquer usuário autenticado
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        # Escrita apenas para admins
        return request.user and request.user.is_staff


class TreinamentoViewSet(viewsets.ModelViewSet):
    queryset = Treinamento.objects.all()
    serializer_class = TreinamentoSerializer
    permission_classes = [IsAdminOrReadOnly]


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.all()
    serializer_class = TurmaSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(criado_por=self.request.user)
    
class TurmaDetalheView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request, turma_id):
        print("Usuário autenticado:", request.user)

        try:
            turma = Turma.objects.get(id=turma_id)
        except Turma.DoesNotExist:
            return Response({"detail": "Turma não encontrada."}, status=404)

        if (
            request.user != turma.criado_por
            and not turma.matriculas.filter(aluno=request.user).exists()
        ):
            return Response({"detail": "Acesso negado."}, status=403)

        recursos = Recurso.objects.filter(turma=turma)

        turma_data = TurmaSerializer(turma).data
        recursos_data = RecursoSerializer(
            recursos, many=True, context={"request": request}
        ).data

        return Response({
            "turma": turma_data,
            "recursos": recursos_data,
            "meet_link": turma.meet_link if hasattr(turma, "meet_link") else None,
        })


from rest_framework.parsers import MultiPartParser, FormParser

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        """
        Corrige valores booleanos e garante upload correto de arquivo.
        """
        data = self.request.data

        def parse_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ("true", "1", "t", "yes", "y")
            return False

        acesso_previo = parse_bool(data.get("acesso_previo"))
        draft = parse_bool(data.get("draft"))

        arquivo = data.get("arquivo", None)

        serializer.save(
            acesso_previo=acesso_previo,
            draft=draft,
            arquivo=arquivo  
        )

 
            
class AlunoListView(generics.ListAPIView):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAuthenticated]

class TurmasPorUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Filtra turmas em que o usuário está matriculado
        turmas = Turma.objects.filter(matriculas__aluno_id=user_id).distinct()
        serializer = TurmaSerializer(turmas, many=True)
        return Response(serializer.data)

    
class TurmaUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, turma_id):
        try:
            turma = Turma.objects.get(id=turma_id)
        except Turma.DoesNotExist:
            return Response({"detail": "Turma não encontrada."}, status=404)

        # 🔒 Somente o criador da turma pode editar
        if request.user != turma.criado_por:
            return Response({"detail": "Apenas o criador pode editar esta turma."}, status=403)

        # Atualizar nome, datas etc.
        serializer = TurmaSerializer(turma, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)

        # ✅ Adicionar alunos
        alunos_ids = request.data.get("alunos_ids", [])
        if alunos_ids:
            for aluno_id in alunos_ids:
                aluno = User.objects.filter(id=aluno_id).first()
                if aluno and not turma.matriculas.filter(aluno=aluno).exists():
                    Matricula.objects.create(aluno=aluno, turma=turma)

        # ✅ Adicionar recursos
        recursos = request.data.get("recursos", [])
        for recurso in recursos:
            Recurso.objects.create(
                nome=recurso.get("nome"),
                descricao=recurso.get("descricao"),
                turma=turma,
                arquivo=recurso.get("arquivo"),
                url=recurso.get("url"),
                criado_por=request.user,
            )

        return Response({"detail": "Turma atualizada com sucesso!"}, status=200)