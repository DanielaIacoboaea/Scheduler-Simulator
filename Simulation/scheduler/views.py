from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
import json
from django.http import JsonResponse

from .models import Scheduler, Defaults

# Create your views here.

def index(request):
    return render(request, "scheduler/layout.html")

def scheduler(request, name):
    return render(request, "scheduler/scheduler.html")

def prefilled_scheduler(request, name, type):
    return JsonResponse({"message": "Email sent successfully."}, status=201)