from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class VetProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vet_profile')
    clinic_name = models.CharField(max_length=200)
    clinic_location = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100)
    specialization = models.CharField(max_length=200)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.clinic_name

class VetCertification(models.Model):
    vet = models.ForeignKey(VetProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issued_by = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    file = models.FileField(upload_to='certifications/')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name