from django.contrib import admin
from .models import Defaults, Scheduler

# Register your models here.

admin.site.register(Scheduler)
admin.site.register(Defaults)
