from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods

User = get_user_model( )

@require_http_methods(["GET", "POST"] )
def register(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        user_type = request.POST.get('role', 'buyer')
        full_name = request.POST.get('full_name', '')
        phone = request.POST.get('phone', '')
        
        if password != confirm_password:
            return render(request, 'register.html', {'error': 'Passwords do not match'})
        
        if User.objects.filter(username=email).exists():
            return render(request, 'register.html', {'error': 'Email already registered'})
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            user_type=user_type,
            phone=phone,
        )
        
        if full_name:
            first_name, last_name = full_name.split(' ', 1) if ' ' in full_name else (full_name, '')
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        
        login(request, user)
        
        if user_type == 'buyer':
            return redirect('marketplace:buyer_dashboard')
        elif user_type == 'seller':
            return redirect('marketplace:seller_dashboard')
        elif user_type == 'vet':
            return redirect('marketplace:vet_dashboard')
        else:
            return redirect('marketplace:index')
    
    return render(request, 'register.html')

@require_http_methods(["GET", "POST"] )
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'marketplace:index')
            return redirect(next_url)
        else:
            return render(request, 'login.html', {'error': 'Invalid email or password'})
    
    return render(request, 'login.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('marketplace:index')