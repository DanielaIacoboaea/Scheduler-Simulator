# Generated by Django 4.0.1 on 2022-11-05 22:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Scheduler',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='Defaults',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.IntegerField(choices=[(1, 'Good'), (0, 'Bad')], default=1, help_text='Prefill Category')),
                ('procId', models.CharField(max_length=64)),
                ('arrivalTime', models.CharField(max_length=64)),
                ('executeTime', models.CharField(max_length=64)),
                ('sliceTime', models.CharField(blank=True, max_length=64)),
                ('boostTime', models.CharField(blank=True, max_length=64)),
                ('queues', models.CharField(blank=True, max_length=64)),
                ('scheduler', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='procs', to='scheduler.scheduler')),
            ],
        ),
    ]