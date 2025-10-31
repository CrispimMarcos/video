from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('alunos/<int:pk>/treinamentos/', views.AlunoTreinamentosView.as_view(), name='aluno-treinamentos'),
    path('treinamentos/', views.TreinamentoListView.as_view(), name='treinamento-list'),
    path('treinamentos/cadastro/', views.TreinamentoViewSet.as_view({'post': 'create'}), name='treinamento-create'),
    path('alunos/', views.AlunoListView.as_view(), name='aluno-list'),
    path('turmas/', views.TurmaListView.as_view(), name='turma-list'),
    path('turmas/cadastro/', views.TurmaViewSet.as_view({'post': 'create'}), name='turma-create'),
    path('turmas/<int:turma_id>/detalhes/', views.TurmaDetalheView.as_view(), name='turma_detalhes'),
    path("turmas/<int:turma_id>/editar/", views.TurmaUpdateView.as_view(), name="editar_turma"),
    path("turmas/usuario/<int:user_id>/", views.TurmasPorUsuarioView.as_view(), name="turmas-usuario"),

    path('recursos/', views.RecursoListView.as_view(), name='recurso-list'),
    path('recursos/cadastro/', views.RecursoViewSet.as_view({'post': 'create'}), name='recurso-create'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)