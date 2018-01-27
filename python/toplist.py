import urllib.request as ur

PAGE_URL="https://lichess.org/player"
FILE_NAME="toplist.html"

TITLE_VALUES={
	"GM" : 10,
	"IM" : 7,
	"FM" : 5,
	"CM" : 3,
	"NM" : 2,
	"LM" : 1
}

if True:
	print("loading page")
	ur.urlretrieve(PAGE_URL,FILE_NAME)
	print("done")

pagehtml=open(FILE_NAME).read()

variants={}
titles={}

toplists=pagehtml.split("/player/top/200/")
for toplist in toplists[1:]:
	parts=toplist.split("user_top")
	toplist=parts[0]
	parts=parts[0].split(">")
	parts=parts[1].split("<")
	variant=parts[0]
	variants[variant]=0
	titles[variant]=[]
	parts=toplist.split("<i class=\"line")
	for part in parts:
		parts=part.split("</a>")
		playerdata=parts[0]		
		parts=playerdata.split("<span class=\"title\" title=\"")
		if len(parts)>1:			
			parts=parts[1].split("\"")
			titlename=parts[0]
			parts=parts[1].split(">")
			parts=parts[1].split("<")
			title=parts[0]
			value=TITLE_VALUES[title]
			variants[variant]+=value
			titles[variant].append(title)

print("\n Title values:\n")
for title in TITLE_VALUES:
	print("  - {0:s} {1:d}".format(title,TITLE_VALUES[title]))

print("\n Variant scores:\n")
sortedvariants=sorted(variants,key=variants.get,reverse=True)
i=1
for variant in sortedvariants:
	print("  {0:2d}. {1:16s}  {2:4d}  {3:s}".format(i,variant,variants[variant]," ".join(titles[variant])))
	i+=1	

print(" ")