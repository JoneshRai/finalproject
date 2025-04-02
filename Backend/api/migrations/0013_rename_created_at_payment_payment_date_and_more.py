from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_merge_0011_event_stripe_price_id_0011_message_room'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='created_at',
            new_name='payment_date',
        ),
        migrations.RemoveField(
            model_name='event',
            name='stripe_price_id',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='order_id',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='pidx',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='status',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='transaction_id',
        ),
        migrations.AddField(
            model_name='payment',
            name='event_title',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='payment',
            name='amount',
            field=models.DecimalField(decimal_places=2, max_digits=10),
        ),
    ]