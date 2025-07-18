"""Initialize models

Revision ID: 6424cf329e2d
Revises: 
Create Date: 2025-07-11 04:51:00.345832

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '6424cf329e2d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade(engine_name: str) -> None:
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name: str) -> None:
    globals()["downgrade_%s" % engine_name]()





def upgrade_common() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user_account',
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False, comment='User ID'),
    sa.Column('username', mysql.VARCHAR(length=63), nullable=False, comment='Username'),
    sa.Column('hashed_password', mysql.VARCHAR(length=512), nullable=False, comment='Hashed Password'),
    sa.Column('refresh_token', mysql.VARCHAR(length=512), nullable=True, comment='Refresh Token'),
    sa.Column('nickname', mysql.VARCHAR(length=63), nullable=True, comment='Nickname'),
    sa.Column('birth_date', mysql.DATETIME(timezone=True), nullable=False, comment='Birth Date'),
    sa.Column('gender', mysql.ENUM('MALE', 'FEMALE'), nullable=False, comment='Gender'),
    sa.Column('email', mysql.VARCHAR(length=63), nullable=False, comment='Email Address'),
    sa.Column('email_verified', sa.BOOLEAN(), nullable=False, comment='Email Verified'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_user_account')),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('user_id'),
    sa.UniqueConstraint('username'),
    info={'shard_ids': {'common'}},
    mysql_engine='InnoDB'
    )
    op.create_table('email_verification',
    sa.Column('email', mysql.VARCHAR(length=63), nullable=False),
    sa.Column('verification_token', sa.BINARY(length=16), nullable=False, comment='Verification Token'),
    sa.Column('token_expires_at', mysql.DATETIME(timezone=True), nullable=False, comment='Token Expires At'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.ForeignKeyConstraint(['email'], ['user_account.email'], name=op.f('fk_email_verification_email_user_account'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_email_verification')),
    info={'shard_ids': {'common'}},
    mysql_engine='InnoDB'
    )
    op.create_table('follow_association',
    sa.Column('followee_id', sa.BINARY(length=16), nullable=False),
    sa.Column('follower_id', sa.BINARY(length=16), nullable=False),
    sa.ForeignKeyConstraint(['followee_id'], ['user_account.id'], name=op.f('fk_follow_association_followee_id_user_account'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['follower_id'], ['user_account.id'], name=op.f('fk_follow_association_follower_id_user_account'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('followee_id', 'follower_id', name=op.f('pk_follow_association')),
    info={'shard_ids': {'common'}},
    mysql_engine='InnoDB'
    )
    # ### end Alembic commands ###


def downgrade_common() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('follow_association')
    op.drop_table('email_verification')
    op.drop_table('user_account')
    # ### end Alembic commands ###


def upgrade_sequence() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('sequence_user_id',
    sa.Column('id', mysql.BIGINT(unsigned=True), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_sequence_user_id')),
    info={'shard_ids': {'sequence'}},
    mysql_engine='InnoDB'
    )
    # ### end Alembic commands ###


def downgrade_sequence() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('sequence_user_id')
    # ### end Alembic commands ###


def upgrade_shard0() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event_attendance',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('state', mysql.ENUM('PRESENT', 'EXCUSED_ABSENCE', 'UNEXCUSED_ABSENCE'), nullable=False, comment='Attendance State'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance')),
    sa.UniqueConstraint('user_id', 'event_id', 'start', name=op.f('uq_event_attendance_user_id')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('event_attendance_action_log',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('action', mysql.ENUM('ATTEND', 'LEAVE'), nullable=False, comment='Attendance Action'),
    sa.Column('acted_at', mysql.DATETIME(timezone=True), nullable=False, comment='Acted At'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance_action_log')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_event_attendance_action_log_user_id'), 'event_attendance_action_log', ['user_id', 'event_id', 'start'], unique=False)
    op.create_table('event_attendance_forecast',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Event Start Time'),
    sa.Column('forecasted_attended_at', mysql.DATETIME(timezone=True), nullable=False, comment='Forecasted Attendance Time'),
    sa.Column('forecasted_duration', mysql.DOUBLE(asdecimal=True), nullable=False, comment='Forecasted Duration in Seconds'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance_forecast')),
    sa.UniqueConstraint('user_id', 'event_id', 'start', name=op.f('uq_event_attendance_forecast_user_id')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('recurrence_rule',
    sa.Column('freq', mysql.ENUM('SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'), nullable=False, comment='FREQ'),
    sa.Column('until', mysql.DATETIME(), nullable=True, comment='UNTIL'),
    sa.Column('count', mysql.SMALLINT(unsigned=True), nullable=True, comment='COUNT'),
    sa.Column('interval', mysql.SMALLINT(unsigned=True), nullable=False, comment='INTERVAL'),
    sa.Column('bysecond', mysql.JSON(), nullable=True, comment='BYSECOND'),
    sa.Column('byminute', mysql.JSON(), nullable=True, comment='BYMINUTE'),
    sa.Column('byhour', mysql.JSON(), nullable=True, comment='BYHOUR'),
    sa.Column('byday', mysql.JSON(), nullable=True, comment='BYDAY'),
    sa.Column('bymonthday', mysql.JSON(), nullable=True, comment='BYMONTHDAY'),
    sa.Column('byyearday', mysql.JSON(), nullable=True, comment='BYYEARDAY'),
    sa.Column('byweekno', mysql.JSON(), nullable=True, comment='BYWEEKNO'),
    sa.Column('bymonth', mysql.JSON(), nullable=True, comment='BYMONTH'),
    sa.Column('bysetpos', mysql.JSON(), nullable=True, comment='BYSETPOS'),
    sa.Column('wkst', mysql.ENUM('MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'), nullable=False, comment='WKST'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_recurrence_rule')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('recurrence',
    sa.Column('rrule_id', sa.BINARY(length=16), nullable=False),
    sa.Column('rdate', mysql.JSON(), nullable=False, comment='RDATE'),
    sa.Column('exdate', mysql.JSON(), nullable=False, comment='EXDATE'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.ForeignKeyConstraint(['rrule_id'], ['recurrence_rule.id'], name=op.f('fk_recurrence_rrule_id_recurrence_rule'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_recurrence')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('event',
    sa.Column('summary', mysql.VARCHAR(length=63), nullable=False, comment='Summary'),
    sa.Column('location', mysql.VARCHAR(length=63), nullable=True, comment='Location'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('end', mysql.DATETIME(timezone=True), nullable=False, comment='End'),
    sa.Column('is_all_day', sa.BOOLEAN(), nullable=False, comment='Is All Day'),
    sa.Column('recurrence_id', sa.BINARY(length=16), nullable=True),
    sa.Column('timezone', mysql.VARCHAR(length=63), nullable=False, comment='Timezone'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.ForeignKeyConstraint(['recurrence_id'], ['recurrence.id'], name=op.f('fk_event_recurrence_id_recurrence'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event')),
    sa.UniqueConstraint('summary'),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_event_user_id'), 'event', ['user_id'], unique=False)
    # ### end Alembic commands ###


def downgrade_shard0() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_event_user_id'), table_name='event')
    op.drop_table('event')
    op.drop_table('recurrence')
    op.drop_table('recurrence_rule')
    op.drop_table('event_attendance_forecast')
    op.drop_index(op.f('ix_event_attendance_action_log_user_id'), table_name='event_attendance_action_log')
    op.drop_table('event_attendance_action_log')
    op.drop_table('event_attendance')
    # ### end Alembic commands ###


def upgrade_shard1() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event_attendance',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('state', mysql.ENUM('PRESENT', 'EXCUSED_ABSENCE', 'UNEXCUSED_ABSENCE'), nullable=False, comment='Attendance State'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance')),
    sa.UniqueConstraint('user_id', 'event_id', 'start', name=op.f('uq_event_attendance_user_id')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('event_attendance_action_log',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('action', mysql.ENUM('ATTEND', 'LEAVE'), nullable=False, comment='Attendance Action'),
    sa.Column('acted_at', mysql.DATETIME(timezone=True), nullable=False, comment='Acted At'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance_action_log')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_event_attendance_action_log_user_id'), 'event_attendance_action_log', ['user_id', 'event_id', 'start'], unique=False)
    op.create_table('event_attendance_forecast',
    sa.Column('event_id', sa.BINARY(length=16), nullable=False, comment='Event ID'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Event Start Time'),
    sa.Column('forecasted_attended_at', mysql.DATETIME(timezone=True), nullable=False, comment='Forecasted Attendance Time'),
    sa.Column('forecasted_duration', mysql.DOUBLE(asdecimal=True), nullable=False, comment='Forecasted Duration in Seconds'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_attendance_forecast')),
    sa.UniqueConstraint('user_id', 'event_id', 'start', name=op.f('uq_event_attendance_forecast_user_id')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('recurrence_rule',
    sa.Column('freq', mysql.ENUM('SECONDLY', 'MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'), nullable=False, comment='FREQ'),
    sa.Column('until', mysql.DATETIME(), nullable=True, comment='UNTIL'),
    sa.Column('count', mysql.SMALLINT(unsigned=True), nullable=True, comment='COUNT'),
    sa.Column('interval', mysql.SMALLINT(unsigned=True), nullable=False, comment='INTERVAL'),
    sa.Column('bysecond', mysql.JSON(), nullable=True, comment='BYSECOND'),
    sa.Column('byminute', mysql.JSON(), nullable=True, comment='BYMINUTE'),
    sa.Column('byhour', mysql.JSON(), nullable=True, comment='BYHOUR'),
    sa.Column('byday', mysql.JSON(), nullable=True, comment='BYDAY'),
    sa.Column('bymonthday', mysql.JSON(), nullable=True, comment='BYMONTHDAY'),
    sa.Column('byyearday', mysql.JSON(), nullable=True, comment='BYYEARDAY'),
    sa.Column('byweekno', mysql.JSON(), nullable=True, comment='BYWEEKNO'),
    sa.Column('bymonth', mysql.JSON(), nullable=True, comment='BYMONTH'),
    sa.Column('bysetpos', mysql.JSON(), nullable=True, comment='BYSETPOS'),
    sa.Column('wkst', mysql.ENUM('MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'), nullable=False, comment='WKST'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_recurrence_rule')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('recurrence',
    sa.Column('rrule_id', sa.BINARY(length=16), nullable=False),
    sa.Column('rdate', mysql.JSON(), nullable=False, comment='RDATE'),
    sa.Column('exdate', mysql.JSON(), nullable=False, comment='EXDATE'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.ForeignKeyConstraint(['rrule_id'], ['recurrence_rule.id'], name=op.f('fk_recurrence_rrule_id_recurrence_rule'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_recurrence')),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_table('event',
    sa.Column('summary', mysql.VARCHAR(length=63), nullable=False, comment='Summary'),
    sa.Column('location', mysql.VARCHAR(length=63), nullable=True, comment='Location'),
    sa.Column('start', mysql.DATETIME(timezone=True), nullable=False, comment='Start'),
    sa.Column('end', mysql.DATETIME(timezone=True), nullable=False, comment='End'),
    sa.Column('is_all_day', sa.BOOLEAN(), nullable=False, comment='Is All Day'),
    sa.Column('recurrence_id', sa.BINARY(length=16), nullable=True),
    sa.Column('timezone', mysql.VARCHAR(length=63), nullable=False, comment='Timezone'),
    sa.Column('id', sa.BINARY(length=16), autoincrement=False, nullable=False),
    sa.Column('created_at', mysql.DATETIME(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', mysql.DATETIME(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('user_id', mysql.BIGINT(unsigned=True), nullable=False),
    sa.ForeignKeyConstraint(['recurrence_id'], ['recurrence.id'], name=op.f('fk_event_recurrence_id_recurrence'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event')),
    sa.UniqueConstraint('summary'),
    info={'shard_ids': {'shard0', 'shard1'}},
    mysql_engine='InnoDB'
    )
    op.create_index(op.f('ix_event_user_id'), 'event', ['user_id'], unique=False)
    # ### end Alembic commands ###


def downgrade_shard1() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_event_user_id'), table_name='event')
    op.drop_table('event')
    op.drop_table('recurrence')
    op.drop_table('recurrence_rule')
    op.drop_table('event_attendance_forecast')
    op.drop_index(op.f('ix_event_attendance_action_log_user_id'), table_name='event_attendance_action_log')
    op.drop_table('event_attendance_action_log')
    op.drop_table('event_attendance')
    # ### end Alembic commands ###

