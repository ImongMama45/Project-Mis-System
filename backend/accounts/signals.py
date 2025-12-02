from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import StaffProfile

@receiver(post_save, sender=User)
def create_staff_profile(sender, instance, created, **kwargs):
    if created:
        # Create with default role "user" instead of "Maintenance Staff"
        StaffProfile.objects.create(user=instance, role="user")

@receiver(post_save, sender=User)
def save_staff_profile(sender, instance, **kwargs):
    # Only save if the profile exists
    if hasattr(instance, 'staffprofile'):
        instance.staffprofile.save()