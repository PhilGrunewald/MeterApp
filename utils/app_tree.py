#!/usr/bin/python

import json
# import MySQLdb
import MySQLdb.cursors
from meter_ini import *     # reads the database and file path information from meter_ini.py

act_address = '../www/js/activities.json'
screens_address = '../www/js/screens.json'
datafile = open(act_address, 'r')
acts = json.loads(datafile.read().decode("utf-8"))
datafile = open(screens_address, 'r')
screens = json.loads(datafile.read().decode("utf-8"))


def _connectDatabase(_dbHost):
    """ try to connect to server - else to local database """
    global dbHost
    dbHost = _dbHost
    try:
        dbConnection = MySQLdb.connect(host=dbHost, user=dbUser, passwd= dbPass, db=dbName, cursorclass = MySQLdb.cursors.DictCursor)
        cursor = dbConnection.cursor()
    except:
        dbHost='localhost'
        dbConnection = MySQLdb.connect(host=dbHost, user=dbUser, passwd= dbPass, db=dbName, cursorclass = MySQLdb.cursors.DictCursor)
        cursor = dbConnection.cursor()
    return cursor

def getPathCount(tuc,tucNext):
    ''' count instances where this sequence of entries was made '''
    sqlq = "SELECT COUNT(*) AS cnt FROM Activities WHERE path LIKE '%{},{}%';".format(tuc,tucNext)
    cursor.execute(sqlq)
    result = cursor.fetchall()
    count = result[0]['cnt']
    return count

def interact(screenKey, actKey=None, old_screenKey = None):
    ''' list activities for a given screen '''
    options = {'1','2','3','4','5','6'}
    title = screens['screens'][screenKey]['title']
    if (actKey):
        tuc = acts['activities'][actKey]['ID']
    else:
        tuc = ''
    act = screens['screens'][screenKey]['activities']
    print title
    for i in xrange(len(act)):
        tucNext = acts['activities'][act[i]]['ID']
        prob = getPathCount(tuc,tucNext)
        line = "  " +\
                 "{:<5}".format(i + 1) + \
                 "{:<35}".format(act[i]) + \
                 "{:<10}".format(acts['activities'][act[i]]['ID']) + \
                 "({:>5})".format(prob)
        print line
    selection = raw_input("Select ")
    if (selection in options):
        actKey = act[int(selection) - 1]
        new_screenKey = acts['activities'][actKey]['next']
    else:
        # go back
        new_screenKey = old_screenKey
    try:
        interact(new_screenKey, actKey, screenKey)
    except KeyError:
        print 'ERROR at: ' + screenKey + ' > ' + actKey 

cursor = _connectDatabase(dbHost)
root_ini = 'activity root'
interact(root_ini)
