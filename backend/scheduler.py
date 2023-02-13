import threading
import time
import schedule
from manager import update_song


def run_continuously(interval=1):
  cease_continuous_run = threading.Event()

  class ScheduleThread(threading.Thread):
    @classmethod
    def run(cls):
      while not cease_continuous_run.is_set():
        schedule.run_pending()
        time.sleep(interval)

  continuous_thread = ScheduleThread()
  continuous_thread.start()
  return cease_continuous_run

def start_update_timer():
  # schedule.every().day.at("00:00").do(update_song)
  # schedule.every().second.do(update_song)
  run_continuously()
