#!/usr/bin/python

import sys
import getopt
import json
import MySQLdb.cursors
import meter_ini as db      # database credentials

opt_hits = False

def _getJSON(filePath):
    """ returns json from file """
    datafile = open(filePath, 'r')
    return json.loads(datafile.read().decode("utf-8"))


def _connectDatabase(_dbHost):
    """ try to connect to server - else to local database """
    global dbHost
    dbHost = _dbHost
    try:
        dbConnection = MySQLdb.connect(host=db.Host, user=db.User, passwd= db.Pass, db=db.Name, cursorclass = MySQLdb.cursors.DictCursor)
        cursor = dbConnection.cursor()
    except:
        dbHost='localhost'
        dbConnection = MySQLdb.connect(host=dbHost, user=dbUser, passwd= dbPass, db=dbName, cursorclass = MySQLdb.cursors.DictCursor)
        cursor = dbConnection.cursor()
    return cursor


def getPathCount(tuc,tucNext):
    """ count instances where this sequence of entries was made """
    # NOTE: this is merely a count of the sequence of two tuc's
    # there are of course many paths to make this two step choice
    # passing the total path would yield lower (and more precice) numbers
    sqlq = "SELECT COUNT(*) AS cnt FROM Activities WHERE path LIKE '%{},{}%';".format(tuc,tucNext)
    cursor.execute(sqlq)
    result = cursor.fetchall()
    count = result[0]['cnt']
    return count


def interact(screenKey, actKey, old_screenKey):
    """ list activities for a given screen """
    options = {'1','2','3','4','5','6'}
    seperator = '_' * 47
    if opt_hits:
        seperator = seperator + '_' * 7

    title = screens['screens'][screenKey]['title']
    if (actKey):
        tuc = acts['activities'][actKey]['ID']
    else:
        tuc = ''
    act = screens['screens'][screenKey]['activities']
    print "\nScreen: {}".format(screenKey)
    print seperator
    line = "{:<5}".format("Key") + \
           "{:<35}".format("Activity") + \
           "{:^7}".format("ID")
    if opt_hits:
        line = line + "{:^7}".format("Hits")
    print line
    print seperator
    i = 0
    for a in act:
        tucNext = acts['activities'][a]['ID']
        hits = ''
        if opt_hits:
            hits = getPathCount(tuc,tucNext)
        i += 1
        line = "{:^5}".format(i) + \
               "{:<35}".format(a) + \
               "{:>7}".format(tucNext) + \
               "{:>7}".format(hits)
        print line
    print seperator
    selection = raw_input("Select key: ")
    if (selection in options):
        # get json key for this activity and the next screen
        actKey = act[int(selection) - 1]
        new_screenKey = acts['activities'][actKey]['next']
    else:
        # go back
        new_screenKey = old_screenKey
    return [new_screenKey, actKey, screenKey]



def main(argv):
    """ Check for arguments """
    nextScreen  = ['activity root', None, None]
    global opt_hits
    helpStr =  'app_tree.py [ch] \n options \n [-h,--help]\t\tthis help \n [-c,--hitcount]\tshow usage of buttons'
    try:
       opts, args = getopt.getopt(argv,"ch",["hitcount","help"])
    except getopt.GetoptError:
       print helpStr
       sys.exit(2)
    for opt, arg in opts:
       if opt in ("-h", "--help"):
          print helpStr
          sys.exit()
       elif opt in ("-c", "--hitcount"):
          opt_hits = True
    while (nextScreen[0] != 'home'):
        nextScreen = interact(nextScreen[0],nextScreen[1],nextScreen[2])
    print "Entry complete\n\n"


if __name__ == "__main__":
    acts        = _getJSON( '../www/js/activities.json')
    screens     = _getJSON('../www/js/screens.json')
    cursor      = _connectDatabase(db.Host)
    main(sys.argv[1:])
