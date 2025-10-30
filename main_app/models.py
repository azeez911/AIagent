from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class UserProfile(AbstractUser):
    phone=models.CharField(max_length=11,unique=True)
    companyName=models.CharField(max_length=100)
    address=models.CharField(max_length=255)
    SubscriptionName=models.CharField(max_length=100,default='Free')    
    

    
     

    def __str__(self):
        return self.username
