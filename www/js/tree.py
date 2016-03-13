import json
datafile = open('/Users/phil/Sites/MeterApp/www/js/activities.json', 'r')
acts = json.loads(datafile.read().decode("utf-8"))
datafile = open('/Users/phil/Sites/MeterApp/www/js/screens.json', 'r')
screens = json.loads(datafile.read().decode("utf-8"))

level = 0
def recursive(node):
    global level
    level += 1
    for branch in screens['screens'][node]['activities']:
            nextNode = acts['activities'][branch]['next']
            print '\t'*level + node + ' > ' + branch + ' > ' + nextNode
            if (nextNode == 'home'):
                print '## end home'
                level = 0
                break
            if (nextNode == 'enjoyment'):
                level = 0
                break
            try:
                recursive(nextNode)
            except KeyError:
                print 'ERROR at: ' + node + ' > ' + branch + ' > ' + nextNode

recursive('home')
    
