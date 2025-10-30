from django import forms
from .models import UserProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm


UserProfile=get_user_model()

class UserProfileForm(UserCreationForm):
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'phone', 'companyName', 'address']
