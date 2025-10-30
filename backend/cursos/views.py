from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
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
        user = self.request.user
        today = timezone.now().date()

        matriculas = Matricula.objects.filter(aluno=user).select_related(
            "turma__treinamento"
        )

        accessible_resource_ids = set()

        for matricula in matriculas:
            turma = matricula.turma
            recursos_turma = Recurso.objects.filter(turma=turma)

            for recurso in recursos_turma:
                # Regra 2: Antes da data de início, só acesso_previo=True
                if today < turma.data_inicio:
                    if recurso.acesso_previo:
                        accessible_resource_ids.add(recurso.id)
                # Regra 3: Após (ou na) data de início, só se draft=False
                else:
                    if not recurso.draft:
                        accessible_resource_ids.add(recurso.id)

        return Recurso.objects.filter(id__in=accessible_resource_ids)


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


from rest_framework.parsers import MultiPartParser, FormParser

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        """
        Corrige os valores booleanos vindos do FormData (que chegam como string).
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

        serializer.save(
            acesso_previo=acesso_previo,
            draft=draft,
        )

# views.py
class AlunoListView(generics.ListAPIView):
    queryset = Aluno.objects.all()
    print("Listando alunos", queryset)
    serializer_class = AlunoSerializer
    permission_classes = [IsAuthenticated]
