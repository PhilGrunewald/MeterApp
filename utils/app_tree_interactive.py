#!/usr/bin/python

import json

act_address = '/Users/Marina/Meter/MeterApp/www/js/activities.json'
screens_address = '/Users/Marina/Meter/MeterApp/www/js/screens.json'
datafile = open(act_address, 'r')
acts = json.loads(datafile.read().decode("utf-8"))
datafile = open(screens_address, 'r')
screens = json.loads(datafile.read().decode("utf-8"))

def interact(node, old_node = None):
	title = screens['screens'][node]['title']
	menu = screens['screens'][node]['activities']
	print title
	for i in xrange(len(menu)):
		temp_new_node = acts['activities'][menu[i]]['next']
		if not ((temp_new_node == 'other specify') or (temp_new_node == '') or (temp_new_node == 'home')):
			string = "  " + "{:<5}".format(i + 1) + "{:<35}".format(menu[i]) + "{:<10}".format(acts['activities'][menu[i]]['ID'])
		else:
			string = "  " + "{:<35}".format(menu[i]) + "{:<10}".format(acts['activities'][menu[i]]['ID'])
		print string
	if (old_node == None):
		selection = int(raw_input("Type index to select "))
		new_node = acts['activities'][menu[selection - 1]]['next']
	else:
		selection = int(raw_input("Type index to select, or press 0 to go back up "))
		if (selection == 0):
			new_node = old_node
		else:
			new_node = acts['activities'][menu[selection - 1]]['next']
	if not ((new_node == 'other specify') or (new_node == '')): 
		try:
		    interact(new_node, node)
		except KeyError:
		    print 'ERROR at: ' + node + ' > ' + branch + ' > ' + nextNode

root_ini = 'activity root'
interact(root_ini)


