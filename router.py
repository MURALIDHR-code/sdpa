import json
import json as json_import
import platform
import os
import requests
import sys


from ibm_watson import AssistantV1

# from watson_developer_cloud import ConversationV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

authenticator = IAMAuthenticator('aFkveMnv_OKL4nHMyj0HCb068Hb-LkEG4fyQUPzfwHs8')
assistant = AssistantV1(
            version='2020-07-03',
                authenticator=authenticator)
assistant.set_service_url('https://api.eu-gb.assistant.watson.cloud.ibm.com/instances/29093a9d-7ca1-425a-9103-b80c7a5bbb8e')

#workspace_id='',

#assistant.set_http_config({'timeout': 100})
#response = assistant.message(workspace_id=workspace_id, input={
     #   'text': 'What\'s up,Whats buddy?'}).get_result()
#print(json.dumps(response, indent=2))


#assistant = AssistantV1(


 #   ASSISTANT_IAM_API_KEY = 'aFkveMnv_OKL4nHMyj0HCb068Hb-LkEG4fyQUPzfwHs8',
  #  ASSISTANT_IAM_URL = 'https://api.eu-gb.assistant.watson.cloud.ibm.com/instances/29093a9d-7ca1-425a-9103-b80c7a5bbb8e',
   # VERSION = '2020-07-03'
  #username = '{username}',
  #password = '{password}',
  #version = '2017-05-26'
#)

# parent workspace id
workspace_id = '6abc5c45-fcdc-42ab-9f39-1d0baf31f09f'
#assistant.set_http_config({'timeout': 100})
#response = assistant.message(workspace_id=workspace_id, input={
  #      'text': 'What\'s the weather like?'}).get_result()
# text
text='Modern IT Operations Analytics that enables Agile Delivery using Chat Ops Platform Welcomes You?'

# send to router
response = assistant.message(
    workspace_id=workspace_id,
    message_input={
        'text': text
    }
)

print(json.dumps(response.get_result(text))
#print(response.get_result())

# save child workspace id
child_workspace_id = response['context']['5758ad9a-c37c-4894-abf7-9368cbdba4c0']
print (child_workspace_id)
child_workspace_id = response['context']['2e1ab090-5f51-465e-97ad-c831ec32898c']
print (child_workspace_id)

# send to child workspace
child_response = assistant.message(
    workspace_id=child_workspace_id,
    message_input={
        'text': text
    }
)

print(json.dumps(child_response(text))
