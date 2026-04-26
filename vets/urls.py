from django.urls import path
from . import views

app_name = 'vets'

urlpatterns = [
  path('', views.vet_dashboard, name='vet_dashboard'),
  path('consultations/', views.consultations, name='consultations'),    
  path('certifications/', views.certifications, name='certifications'),
  path('certifications/add/', views.add_certification, name='add_certification'),
  path('bookings/', views.bookings, name='bookings'),

]
