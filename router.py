import json
from watson_developer_cloud import ConversationV1

conversation = ConversationV1(
    ASSISTANT_IAM_API_KEY = 'aFkveMnv_OKL4nHMyj0HCb068Hb-LkEG4fyQUPzfwHs8',
    ASSISTANT_IAM_URL = 'https://api.eu-gb.assistant.watson.cloud.ibm.com/instances/29093a9d-7ca1-425a-9103-b80c7a5bbb8e',
    VERSION: '2020-07-03'
  #username = '{username}',
  #password = '{password}',
  #version = '2017-05-26'
)

# parent workspace id
workspace_id = '6abc5c45-fcdc-42ab-9f39-1d0baf31f09f'

# text
text = 'Modern IT Operations Analytics that enables Agile Delivery using Chat Ops Platform Welcomes You?. Myself Squadnagi Enterprise Advisor! Bot. ' # or whatever fits your use case

# send to router
response = conversation.message(
    workspace_id=workspace_id,
    message_input={
        'text': text
    }
)

print(json.dumps(response, indent=2))

# save child workspace id
child_workspace_id = response['context']['5758ad9a-c37c-4894-abf7-9368cbdba4c0']
print child_workspace_id

# send to child workspace
child_response = conversation.message(
    workspace_id=child_workspace_id,
    message_input={
        'text': text
    }
)

print(json.dumps(child_response, indent=2))
