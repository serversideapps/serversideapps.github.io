import urllib.request as ur
import os.path
import time
import re
from datetime import datetime

epoch = datetime.utcfromtimestamp(0)

def unix_time_sec(dt):
    return (dt - epoch).total_seconds()

MAX_PAGE=40

VERBOSE=False

LIMIT=900

PLAYERS=[
	{"nicks":["lasker"],"votes":0,"mentions":0},
	{"nicks":["morphy"],"votes":0,"mentions":0},	
	{"nicks":["steinitz"],"votes":0,"mentions":0},
	{"nicks":["capablanca"],"votes":0,"mentions":0},
	{"nicks":["karpov"],"votes":0,"mentions":0},
	{"nicks":["kasparov"],"votes":0,"mentions":0},
	{"nicks":["carlsen"],"votes":0,"mentions":0},
	{"nicks":["tal"],"votes":0,"mentions":0},
	{"nicks":["botvinnik"],"votes":0,"mentions":0},
	{"nicks":["fischer"],"votes":0,"mentions":0},
	{"nicks":["anand"],"votes":0,"mentions":0},
	{"nicks":["petrosian"],"votes":0,"mentions":0},
	{"nicks":["philidor"],"votes":0,"mentions":0},
	{"nicks":["staunton"],"votes":0,"mentions":0},
	{"nicks":["spassky"],"votes":0,"mentions":0},
]

posters={}
postertimes={}

totalposts=0

totalvotes=0

postsbytime={}

def filename(i):
	return "page{0:d}.html".format(i)

def download():
	for i in range(1,MAX_PAGE):
		print("downloading page {0:d}".format(i))
		if not os.path.isfile(filename(i)):
			ur.urlretrieve("https://lichess.org/forum/general-chess-discussion/best-chess-players-relative-to-their-peers?page={0:d}".format(i),filename(i))
			time.sleep(3)

def loadpage(i):
	return open(filename(i)).read()

def upvotes(nick):
	return [nick+" up","up "+nick,"upvote "+nick,nick+" upvote"]
def downvotes(nick):
	return [nick+" down","down "+nick,"downvote "+nick,nick+" downvote"]

def analyzepost(no,content):
	global totalvotes
	lcontent=content.lower()
	lines=lcontent.split("<br />")
	votecontent=""
	for player in PLAYERS:
		for nick in player["nicks"]:
			for line in lines:
				for upvote in upvotes(nick):
					if upvote in line:
						player["votes"]+=1
						totalvotes+=1
						if VERBOSE:
							print("#{0:4d} up {1:s}".format(no,nick))
				for downvote in downvotes(nick):
					if downvote in line:
						player["votes"]-=2
						totalvotes-=2
						if VERBOSE:
							print("#{0:4d} down {1:s}".format(no,nick))
				if nick in line:
					player["mentions"]+=1

def analyze(i):
	global totalposts
	page=loadpage(i)
	posts=page.split("<div class=\"post\" id=\"")
	posts.pop(0)
	for post in posts:
		totalposts+=1
		postparts=post.split("datetime=\"")
		postparts=postparts[1].split("\"")
		dtstr=postparts[0]
		dtobj=datetime.strptime(dtstr,"%Y-%m-%dT%H:%M:%S.%fZ")
		tsec=unix_time_sec(dtobj)
		postparts=post.split("\"")
		postno=int(postparts[0])
		postparts=post.split("</i>")
		postparts=postparts[1].split("</a>")
		poster=postparts[0]		
		postparts=post.split("<p class=\"message\">")
		postparts=postparts[1].split("</p>")
		content=postparts[0]
		if not poster in posters:
			posters[poster]=len(content)
			postertimes[poster]=[tsec]
		else:
			posters[poster]+=len(content)
			postertimes[poster].append(tsec)
		#print("analyzing post {0:d}".format(postno))
		postsbytime[tsec]=content
		analyzepost(postno,content)

def analyzeall():
	for i in range(1,MAX_PAGE):
		#print("analyzing page {0:d}".format(i))
		analyze(i)
	print("totalposts {0:d} totalvotes {1:d} ratio {2:f}".format(totalposts,totalvotes,totalvotes/totalposts))
	votes={}
	mentions={}
	for player in PLAYERS:
		votes[player["nicks"][0]]=player["votes"]
		mentions[player["nicks"][0]]=player["mentions"]
	print("votes")
	sortednicks=sorted(votes,key=votes.get,reverse=True)
	i=1
	for nick in sortednicks:
		print(" {0:2d}. {1:20s} {2:4d}".format(i,nick,25+votes[nick]))
		i+=1
	print("mentions")
	sortednicks=sorted(mentions,key=mentions.get,reverse=True)
	i=1
	for nick in sortednicks:
		print(" {0:2d}. {1:20s} {2:4d}".format(i,nick,mentions[nick]))
		i+=1
	if True:
		print("number of characters by posters")
		sortedposters=sorted(posters,key=posters.get,reverse=True)
		i=1
		for poster in sortedposters:
			if i<=20:
				print(" {0:2d}. {1:20s} {2:4d}".format(i,poster,posters[poster]))
			i+=1	
	if False:
		corr={}
		for p1 in postertimes:
			for p2 in postertimes:
				if p1!=p2:
					if not p2+" # "+p1 in corr:
						total=0
						for t1 in postertimes[p1]:
							for t2 in postertimes[p2]:
								if abs(t1-t2)<LIMIT:
									total+=1
						corr[p1+" # "+p2]=total
		sortedcorr=sorted(corr,key=corr.get,reverse=True)
		i=1
		for poster in sortedcorr:
			if i<=10:
				print(" {0:2d}. {1:20s} {2:4f}".format(i,poster,corr[poster]))
				parts=poster.split(" # ")
				p1=parts[0]
				p2=parts[1]
				for t1 in postertimes[p1]:
							for t2 in postertimes[p2]:
								if abs(t1-t2)<LIMIT:
									print("----------------------")
									print(p1)
									print(postsbytime[t1])
									print("......................")
									print(p2)
									print(postsbytime[t2])
									print("----------------------")
			i+=1	