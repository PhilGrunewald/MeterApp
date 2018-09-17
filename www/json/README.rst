MeterActivities (activities)
============================

A json structure for activities and their navigation

Screens
-------

Lists keys to activities.json
Each screen key has six such 'activity' keys

Activities
-------------


Each entry can be thought of as a button on the screen

- "caption" is displayed on the button
- "title" describes the activity on the home screen and is used as plain text description in visualisations
- "ID" is the time-use-code based on an extended version of HETUS
- "help" optionally displayed in the app to explain the meaning of a button
- "value" used for ranking questions or for numerical calculations, such as relative adjustment of time by, say, 15 minutes
- "icon" and image file in png format stored in /img
- "next" key in screen.json to display the next screen after pressing this button

LegendHousehold
---------------

- all columns in the Household table of the Meter database are listed as keys
- under each key possible values are assigned their 'meaning' as plain text
- "q" denotes the question asked to which these are the anwers
- not all possible answers are listed. For instance, counted values like "How many screens do you have", can be left as numerical values
- Note all these values have been uploaded to Table `Legend` in the Meter schema using json2sql_

LegendIndividual
----------------

- same as Legend Household, but for table Individual on Meter database
- Note all these values have been uploaded to Table `Legend` in the Meter schema using json2sql_


.. _json2sql: ../../scripts/json2sql.py
