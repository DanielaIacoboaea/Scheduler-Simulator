from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
import json

# Create your views here.

def index(request):
    return render(request, "scheduler/index.html")