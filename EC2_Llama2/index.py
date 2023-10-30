from flask import Flask, request
from langchain.llms import CTransformers
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate 

# Setup Classes

print("Setup Llama")
llm = CTransformers(model="TheBloke/Llama-2-13B-Ensemble-v5-GGUF", model_file="llama-2-13b-ensemble-v5.Q5_K_M.gguf", model_type="llama")
print("Setup Llama Complete")
print("Setup Template")
template = """
You are a program that decide what features a business should have according to its description. 
The features available are:

- email: This service sends the receipt of transactions by mail if the customer requests it.
- print: Allows the system to print receipts and permanent payment QRs.
- eth: Allows the system to receive payments on any EVM compatible network
- jupiter: This service performs currency exchange at the time of payment by Jupiter, this includes payments with tokens and spl-tokens.
- tipping: Allows the system to send payment requests by mail.
- crosschain: Allows pay from one source network to another by Wormhole.
- fiat: Allows the use of traditional finance by Stripe.


The business description is the following and is delimited by triple backquotes.

```{text}```

Return all the features that best fit the business and and your return must be only a json format with every feature key asigned with bool value without comments.

Your JSON:
"""

prompt = PromptTemplate(template=template, input_variables=["text"])
llm_chain = LLMChain(prompt=prompt, llm=llm)

print("Setup Template Complete")

# Functions
def getSettings(input):
    res = llm_chain.run(input)
    return res

first = "A physical and online college supply store, active all exchange features and stripe, the store offers a comprehensive selection of academic essentials, from textbooks and stationery to tech gadgets, catering to the diverse needs of students seeking convenience and accessibility in their pursuit of higher education."
getSettings(first)

# Flask Setup

app = Flask(__name__)

@app.route('/ai-settings',methods=['POST'])
def aiSettings():
    data = request.json["prompt"]
    print("Getting Settings...")
    print(data)
    res = getSettings(data)
    print(res)
    return res

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)