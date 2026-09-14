#!/bin/sh

dropdb --if-exists task_tracker
createdb task_tracker
psql task_tracker < sql/schema.sql
