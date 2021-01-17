import tweepy
from textblob import TextBlob
import pandas as pd
import numpy as np
import re
import json

# Keys removed to prevent issues as we're uploading to a public repository
consumer_key = "***"
consumer_secret = "***"
access_token = "***"
access_token_secret = "***"

# Creating the authentication object
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
# Setting your access token and secret
auth.set_access_token(access_token, access_token_secret)
# Creating the API object while passing in auth information
api = tweepy.API(auth)

# Search parameters
language = "en"
date_since = "2020-12-16"
result_type = "recent"

# Situation parameters
situations = ["bushfire", "earthquake", "flood", "hurricane", "storm"]

# Location parameters
sydney = "-33.865143,151.209900,20km"
melbourne = "-37.81585,144.96313,20km"
brisbane = "-27.470125,153.021072,20km"
adelaide = "-34.9281805,138.5999312,20km"
perth = "-31.9527121,115.8604796,20km"
darwin = "-12.46044,130.8410469,20km"
canberra = "-35.2975906,149.1012676,20km"
hobart = "-42.8825088,147.3281233,20km"

cities = [sydney, melbourne, brisbane, adelaide, perth, darwin, canberra, hobart]

all_tweets = []

for city in cities:
    city_split = city.split(',')
    city_lat = city_split[0]
    city_long = city_split[1]
    
    for situation in situations:
        results = api.search(q=situation, geocode=city, lang=language, since=date_since, result_type=result_type)
        
        for tweet in results:
            tweet_data = [tweet.created_at, tweet.user.screen_name, city_lat, city_long, situation, tweet.text]
            all_tweets.append(tweet_data)

# Create a dataframe with a column called Tweets
df = pd.DataFrame(data=all_tweets, columns=["Timestamp", "Username", "Latitude", "Longitude", "Situation", "Tweet Text"])     

# Show the first rpp rows of data
df.head()


# Create a function to clean the tweets
def cleanTxt(text):
 text = re.sub('@[A-Za-z0–9]+', '', text) #Removing @mentions
 text = re.sub('#', '', text) # Removing '#' hash tag
 text = re.sub('RT[\s]+', '', text) # Removing RT
 text = re.sub('https?:\/\/\S+', '', text) # Removing hyperlink
 
 return text

# Clean the tweets
df['Tweet Text'] = df['Tweet Text'].apply(cleanTxt)

# Show the cleaned tweets
df

# Create a function to get the subjectivity
def getSubjectivity(text):
   return TextBlob(text).sentiment.subjectivity

# Create a function to get the polarity
def getPolarity(text):
   return  TextBlob(text).sentiment.polarity


# Create two new columns 'Subjectivity' & 'Polarity'
df['Subjectivity'] = df['Tweet Text'].apply(getSubjectivity)
df['Polarity'] = df['Tweet Text'].apply(getPolarity)

# Show the new dataframe with columns 'Subjectivity' & 'Polarity'
df

# Create a function to compute negative (-1), neutral (0) and positive (+1) analysis
def getAnalysis(score):
  if score < 0:
    return 'Negative'
  elif score == 0:
    return 'Neutral'
  else:
    return 'Positive'

df['Analysis'] = df['Polarity'].apply(getAnalysis)

# Sort dataframe by timestamp
df.sort_values(by=['Timestamp'], inplace=True, ascending=False)

# Show the dataframe
#df.head(20)

grouped_df = pd.DataFrame(columns=['num_tweets', 'avg_sentiment'])
grouped_df['num_tweets']= df.groupby(['Latitude', 'Longitude', 'Situation'])['Timestamp'].count()
grouped_df['avg_sentiment'] =  df.groupby(['Latitude', 'Longitude', 'Situation'])['Polarity'].mean()
grouped_df = grouped_df.reset_index()
grouped_df = grouped_df.rename(columns={'Situation': 'situation'})
grouped_df['coordinates'] = "[" + grouped_df['Latitude'].astype(str) + "," + grouped_df['Longitude'].astype(str) + "]"
grouped_df.drop(grouped_df.columns[[0,1]], axis=1, inplace=True)
column_titles=['coordinates', 'situation', 'num_tweets', 'avg_sentiment']
grouped_df = grouped_df.reindex(columns=column_titles)
#print(grouped_df)

json_list = []

for index, row in grouped_df.iterrows():
    json_entry = {}
    json_entry['coordinates'] = row['coordinates']
    json_entry['situation'] = row['situation']
    json_entry['num_tweets'] = row['num_tweets']
    json_entry['avg_sentiment'] = row['avg_sentiment']
    json_list.append(json_entry)

json_string = json.dumps(json_list)
print(json_string)

with open('data.json', 'w') as json_file:
    json_file.write(json_string + '\n')