from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class Treinamento(models.Model):
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome


class Turma(models.Model):
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, related_name="turmas")
    nome = models.CharField(max_length=150)
    data_inicio = models.DateField()
    data_conclusao = models.DateField(blank=True, null=True)
    link_acesso = models.URLField(max_length=300, blank=True, null=True)

    def __str__(self):
        return f"{self.nome} - {self.treinamento.nome}"


class Recurso(models.Model):
    TIPO_RECURSO_CHOICES = [
        ('video', 'Vídeo'),
        ('pdf', 'Arquivo PDF'),
        ('zip', 'Arquivo ZIP'),
        ('link', 'Link'),
        ('outro', 'Outro'),
    ]

    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name="recursos")
    tipo_recurso = models.CharField(max_length=10, choices=TIPO_RECURSO_CHOICES)
    nome = models.CharField(max_length=150)
    descricao = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)  # ✅ Adicione este campo
    arquivo = models.FileField(upload_to='recursos/', blank=True, null=True)  # ✅ Para upload direto (PDF, ZIP, etc.)
    acesso_previo = models.BooleanField(default=False)
    draft = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_recurso_display()})"


class AlunoManager(BaseUserManager):
    def create_user(self, email, nome, password=None, **extra_fields):
        if not email:
            raise ValueError("O campo e-mail é obrigatório.")
        email = self.normalize_email(email)
        user = self.model(email=email, nome=nome, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nome, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, nome, password, **extra_fields)
    

class Aluno(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nome"]

    objects = AlunoManager()

    def __str__(self):
        return self.nome


class Matricula(models.Model):
    turma = models.ForeignKey("Turma", on_delete=models.CASCADE, related_name="matriculas")
    aluno = models.ForeignKey("Aluno", on_delete=models.CASCADE, related_name="matriculas")
    data_matricula = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("turma", "aluno")
        verbose_name_plural = "Matrículas"

    def __str__(self):
        return f"{self.aluno.nome} em {self.turma.nome}"

