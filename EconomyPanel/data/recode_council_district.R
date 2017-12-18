# recode_council_district.R
# - remove some inconsistencies in the council_district variable
# - reformat the council district names
# - save as EconomyPanel.csv
# 
# written by Adam Scherling for the LA City Controller.
# last edited 12/18/2017

# change the directory as needed
setwd('~/github/aescherling.github.io/EconomyPanel/data')

# read in the latest data from Beacon. make sure the file is correct.
df <- read.csv('Controller_Data_April_and_November.csv', stringsAsFactors=F)

# subset with city level data
city <- df$locality=="LOS ANGELES CITY"

# look at the unique "council_district" levels
unique(df$council_district[city])

# figure out what to do with blanks, 99, CITY TOTAL, and City...

# View(df[city & df$council_district=="City",])
# the "City" data are taxes.
# Rename as "City of Los Angeles". Use this label for all city-level data.
df$council_district[city & df$council_district=="City"] <- "City of Los Angeles"

# View(df[city & df$council_district=="",])
# the blanks are hotel data. relabel to City
df$council_district[city & df$council_district==""] <- "City of Los Angeles"

# View(df[city & df$council_district=="99",])
# more tax data. relabel to "City of Los Angeles"
df$council_district[city & df$council_district=="99"] <- "City of Los Angeles"

# building permit data. still appropriate to change to "City of Los Angeles"
# View(df[city & df$council_district=="CITY TOTAL",])
df$council_district[city & df$council_district=="CITY TOTAL"] <- "City of Los Angeles"

# now relabel each council district
# go from council_district==1 --> locality=="Council District 1"
districts <- sapply(df$council_district, function(cd) {return(cd %in% 1:15)})
df$council_district[districts] <- sapply(df$council_district[districts], 
	function(cd) {
		return(paste0("Council District ", cd))
	}
)

# now a blank in council_district implies non-city-level (e.g. county or MSA)
unique(df$council_district)
unique(df$council_district[city])

write.csv(df, 'EconomyPanel.csv', row.names=F)
