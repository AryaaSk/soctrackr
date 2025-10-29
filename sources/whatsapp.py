import aspose.email as ae
from aspose.email.storage.olm import OlmStorage

file_path = "emailExport.olm"
olm = OlmStorage.from_file(file_path)
if olm is None:
    raise Exception("Failed to load OLM")

# get the folder object for Inbox
inbox = olm.get_folder("Inbox", True)  # True for ignore case
if inbox is None:
    raise Exception("Inbox folder not found")

# now enumerate messages
for msg_info in inbox.enumerate_messages():  # the method according to docs
    print("Subject:", msg_info.subject)
    # extract full message if needed
    mapi = olm.extract_message(msg_info)
    print("  From:", mapi.sender_email_address)
    print("  Received:", mapi.client_submit_time)
    # maybe attachments, etc