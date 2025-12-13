from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Notification
from calendar_system.models import MaintenanceSchedule
from maintenance.models import MaintenanceRequest


# =============================================================================
# NEW REQUEST CREATION - Notify all admins
# =============================================================================
@receiver(post_save, sender=MaintenanceRequest)
def notify_new_request(sender, instance, created, **kwargs):
    """Notify all admins when a new maintenance request is created"""
    if created:
        # Get all admin users (users with is_staff=True or is_superuser=True)
        admin_users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
        admin_users = admin_users.distinct()
        
        # Create notification for each admin
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                message=f"New maintenance request #{instance.id} created by {instance.requester_name or instance.created_by.username if instance.created_by else 'Unknown'}.",
                maintenance_request=instance,
            )


# =============================================================================
# STAFF ACCEPTS REQUEST - Notify admins
# =============================================================================
@receiver(pre_save, sender=MaintenanceRequest)
def store_old_assigned_to(sender, instance, **kwargs):
    """Store the old assigned_to value before save"""
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_assigned_to = old_instance.assigned_to
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_assigned_to = None
            instance._old_status = None
    else:
        instance._old_assigned_to = None
        instance._old_status = None


@receiver(post_save, sender=MaintenanceRequest)
def notify_staff_acceptance(sender, instance, created, **kwargs):
    """Notify admins when staff accepts/claims a request"""
    if created:
        return  # Skip on creation (handled by notify_new_request)
    
    old_assigned_to = getattr(instance, "_old_assigned_to", None)
    old_status = getattr(instance, "_old_status", None)
    
    # Check if assigned_to changed from None to a staff member (staff accepted/claimed)
    if old_assigned_to is None and instance.assigned_to is not None:
        # Get all admin users
        admin_users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
        admin_users = admin_users.distinct()
        
        staff_name = instance.assigned_to.get_full_name() or instance.assigned_to.username
        
        # Notify all admins
        for admin in admin_users:
            # Don't notify if the admin is the one who accepted (in case admin accepted it)
            if admin != instance.assigned_to:
                Notification.objects.create(
                    user=admin,
                    message=f"Request #{instance.id} has been accepted by {staff_name}.",
                    maintenance_request=instance,
                )
    
    # Notify status changes (existing functionality)
    if old_status and old_status != instance.status:
        # Notify the requester
        if instance.created_by:
            Notification.objects.create(
                user=instance.created_by,
                message=f"Your maintenance request #{instance.id} status changed to {instance.get_status_display()}.",
                maintenance_request=instance,
            )

        # Notify assigned staff if any
        if instance.assigned_to and instance.assigned_to != instance.created_by:
            Notification.objects.create(
                user=instance.assigned_to,
                message=f"Request #{instance.id} status changed to {instance.get_status_display()}.",
                maintenance_request=instance,
            )
        
        # Notify admins of status changes
        admin_users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
        admin_users = admin_users.distinct()
        
        for admin in admin_users:
            # Don't send duplicate notification if admin is the assigned staff or requester
            if admin != instance.assigned_to and admin != instance.created_by:
                Notification.objects.create(
                    user=admin,
                    message=f"Request #{instance.id} status changed to {instance.get_status_display()}.",
                    maintenance_request=instance,
                )


# =============================================================================
# SCHEDULE NOTIFICATIONS
# =============================================================================
@receiver(post_save, sender=MaintenanceSchedule)
def notify_schedule(sender, instance, created, **kwargs):
    """Notify when a schedule is added or updated"""
    req = instance.request
    staff = instance.assigned_staff

    # Notify requester (the person who created the request)
    if req.created_by:
        Notification.objects.create(
            user=req.created_by,
            message=f"Your maintenance request #{req.id} has been scheduled for {instance.schedule_date.strftime('%B %d, %Y')}.",
            maintenance_request=req,
        )

    # Notify assigned staff
    if staff and hasattr(staff, 'user') and staff.user:
        Notification.objects.create(
            user=staff.user,
            message=f"You have been assigned a maintenance task (Request #{req.id}) scheduled for {instance.schedule_date.strftime('%B %d, %Y')}.",
            maintenance_request=req,
        )
    elif staff and isinstance(staff, User):
        # In case assigned_staff is directly a User object
        Notification.objects.create(
            user=staff,
            message=f"You have been assigned a maintenance task (Request #{req.id}) scheduled for {instance.schedule_date.strftime('%B %d, %Y')}.",
            maintenance_request=req,
        )