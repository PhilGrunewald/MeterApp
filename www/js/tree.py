import json
datafile = open('/Users/phil/Sites/MeterApp/www/js/activities.json', 'r')
acts = json.loads(datafile.read().decode("utf-8"))
datafile = open('/Users/phil/Sites/MeterApp/www/js/screens.json', 'r')
screens = json.loads(datafile.read().decode("utf-8"))

def recursive(node,level):
    for branch in screens['screens'][node]['activities']:
            nextNode = acts['activities'][branch]['next']
            print '.'*level + node + ' > ' + branch + ' > ' + nextNode
            if not ((nextNode == 'location') or (nextNode == 'home') or (nextNode == 'enjoyment')):
                try:
                    level += 1
                    recursive(nextNode,level)
                except KeyError:
                    print 'ERROR at: ' + node + ' > ' + branch + ' > ' + nextNode

recursive('home',0)
    
