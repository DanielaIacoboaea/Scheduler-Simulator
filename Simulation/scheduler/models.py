from django.db import models

# Create your models here.

class Scheduler(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return f"{self.name}"


class Defaults(models.Model):
    scheduler = models.ForeignKey(Scheduler, on_delete=models.CASCADE, related_name="procs")
    TYPE_CHOICES = (
        (1, 'Good'),
        (0, 'Bad')
    )
    type = models.IntegerField(default=1, choices=TYPE_CHOICES, help_text="Prefill Category")
    procId = models.CharField(max_length=64)
    arrivalTime = models.CharField(max_length=64)
    executeTime = models.CharField(max_length=64)
    sliceTime = models.CharField(max_length=64, blank=True)
    boostTime = models.CharField(max_length=64, blank=True)
    queues = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return f"Type: {self.type} for Scheduler: {self.scheduler.name}; Proc: {self.procId}, Arrival: {self.arrivalTime}, Execution: {self.executeTime}, Slice: {self.sliceTime}, Boost: {self.boostTime}, Queues: {self.queues}"


