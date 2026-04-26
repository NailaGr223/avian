from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from .models import VetProfile, VetCertification

@login_required
def vet_dashboard(request ):
    if request.user.user_type != 'vet':
        return redirect('marketplace:index')
    
    vet_profile = VetProfile.objects.filter(user=request.user).first()
    
    context = {
        'vet_profile': vet_profile,
    }
    return render(request, 'vet-dashboard.html', context)

@login_required
def consultations(request):
    if request.user.user_type != 'vet':
        return redirect('marketplace:index')
    
    context = {}
    return render(request, 'vet-consultations.html', context)

@login_required
def certifications(request):
    if request.user.user_type != 'vet':
        return redirect('marketplace:index')
    
    vet_profile = VetProfile.objects.filter(user=request.user).first()
    if not vet_profile:
        return redirect('vets:vet_dashboard')
    
    certifications = VetCertification.objects.filter(vet=vet_profile)
    
    context = {
        'certifications': certifications,
    }
    return render(request, 'vet-certifications.html', context)

@login_required
@require_http_methods(["GET", "POST"] )
def add_certification(request):
    if request.user.user_type != 'vet':
        return redirect('marketplace:index')
    
    vet_profile = VetProfile.objects.filter(user=request.user).first()
    if not vet_profile:
        return redirect('vets:vet_dashboard')
    
    if request.method == 'POST':
        name = request.POST.get('name')
        issued_by = request.POST.get('issued_by')
        issue_date = request.POST.get('issue_date')
        expiry_date = request.POST.get('expiry_date')
        file = request.FILES.get('file')
        
        certification = VetCertification.objects.create(
            vet=vet_profile,
            name=name,
            issued_by=issued_by,
            issue_date=issue_date,
            expiry_date=expiry_date,
            file=file,
        )
        
        return redirect('vets:certifications')
    
    context = {}
    return render(request, 'vet-add-certification.html', context)

@login_required
def bookings(request):
    if request.user.user_type != 'vet':
        return redirect('marketplace:index')
    
    context = {}
    return render(request, 'vet-bookings.html', context)
