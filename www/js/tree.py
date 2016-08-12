import json
datafile = open('activities.json', 'r')
acts = json.loads(datafile.read().decode("utf-8"))
datafile = open('screens.json', 'r')
screens = json.loads(datafile.read().decode("utf-8"))

def recursive(node,level):
    level += 1
    for branch in screens['screens'][node]['activities']:
            nextNode = acts['activities'][branch]['next']
            caption = acts['activities'][branch]['caption']
            title = acts['activities'][branch]['title']
            # print '.'*level + node + ' > ' + branch + ' > ' + nextNode
            print "{:<35}".format('.  '*level + caption)  +"{:25}".format(title) + branch
            if not ((nextNode == 'other specify') or (nextNode == '') or (nextNode == 'other people') or (nextNode == 'home') or (nextNode == 'enjoyment')):   # '' is for 'Blank'
                try:
                    recursive(nextNode,level)
                except KeyError:
                    print 'ERROR at: ' + node + ' > ' + branch + ' > ' + nextNode

recursive('activity main',-1)
    
