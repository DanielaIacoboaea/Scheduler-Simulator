from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django import forms
import json
from django.http import JsonResponse

from .models import Scheduler, Defaults

# Create your views here.

def index(request):
    """
    Render the home page. From here the user can run schedulers with custom settings 
    or request prefilled settings for each scheduler.
    """
    return render(request, "scheduler/index.html")


def prefilled_scheduler(request, name, type):
    """
    Filter the database based on scheduler name and type of example 
    and return a list with pre-defined processes.
    E.g: name = "FIFO", type = 1 -> return an example where FIFO scheduler performs well 
    """

    # define a list with all the available schedulers
    schedulers = ['FIFO', 'SJF', 'STCF', 'RR', 'MLFQ']

    # define a list with the types of examples
    # 1 - Good 
    # 0 - Bad
    default_types = [0, 1]
    processes = []

    # check if the scheduler and type exist in the database 
    if name in schedulers and type in default_types:
        # get all processes available for this example
        procs = Defaults.objects.all().filter(scheduler__name=name, type=type)

        # add each process from example to the list of processes 
        for proc in procs:
            processes.append({
                "id": proc.procId,
                "arrivalTime": proc.arrivalTime,
                "executeTime": proc.executeTime,
                "quantum": proc.sliceTime,
                "boost": proc.boostTime,
                "queues": proc.queues
            })
            
        return JsonResponse({"default": processes}, status=201)
    else:
        # otherwise return an error
        return JsonResponse({"error": "Scheduler does not exist."}, status=400)
