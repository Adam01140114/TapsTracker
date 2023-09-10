import requests
import os

URL = "https://www.paymycite.com/SearchAgency.aspx"

def ticket_exists(id):
    parameters = {'agency':147, 'plate': '', 'cite':id}
    r = requests.get(url= URL, params=parameters)
    print(f"{id}: {not (r.text.__contains__('Sorry'))}")
    return not (r.text.__contains__('Sorry'))

def get_ticket_id(cdn, number):
    return (cdn) * 1000000 + number

def get_ticket_date(id):
    parameters = {'agency':147, 'plate': '', 'cite':id}
    r = requests.get(url= URL, params=parameters)
    arr = r.text.split('''</font></td><td nowrap="nowrap" style="padding-left:3;padding-right:3;padding-top:10;padding-bottom:10;"><font face="Verdana">''')
    print(len(arr))
    return arr[3]

cadence = 399
citation_number = 123456

series = (255, 366, 377, 388, 399, 400)


for s in series:
    current = 123456
    for decimal in reversed(range(0,5)):
        num = 1
        while ticket_exists(get_ticket_id(s, current + num * pow(10, decimal))):
            if num < 10:
                num += 1
            else:
                break
        current = current + (num-1) * pow(10, decimal)
    print(current)
    f=open("latest.txt", "a")
    f.write(f"{s}: {current}, {get_ticket_date(get_ticket_id(s, current))}\n")
    f.close()




#for i in range(0, 10000):
#    ticket_ID = get_ticket_id(cadence, citation_number+i)
#    parameters = {'agency':147, 'plate': '', 'cite':ticket_ID}
#
#    r = requests.get(url= URL, params=parameters)
#    print(f"{ticket_ID}: {r.text.__contains__('Sorry')}")
#    f=open("results.csv", "a")
#    f.write(f"{ticket_ID},{r.text.__contains__('Sorry')}\r\n")
#    f.close()

