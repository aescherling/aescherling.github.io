# filter_city.R
# select only city-level data (council districts and city as a whole)

setwd('~/github/aescherling.github.io/EconomyPanel/data')
# df <- read.csv('2017.10_updated_data.csv', stringsAsFactors=F)
df <- read.csv('Controller_Data_April_and_November.csv', stringsAsFactors=F)

# select only city level data
df <- df[df$locality=="LOS ANGELES CITY",]

# look at the distribution of "council_district" levels
table(df$council_district)

# figure out what to do with blanks, 99, CITY TOTAL, and City

# the "City" data are taxes.
# Rename as "City of Los Angeles. Use this label for all city-level data.
# View(df[df$council_district=="City",])
df$council_district[df$council_district=="City"] <- "City of Los Angeles"

# View(df[df$council_district=="",])
# the blanks are hotel data. relabel to City
df$council_district[df$council_district==""] <- "City of Los Angeles"

# View(df[df$council_district=="99",])
# more tax data. relabel to "City of Los Angeles"
df$council_district[df$council_district=="99"] <- "City of Los Angeles"

# building permit data. still appropriate to change to "City of Los Angeles"
# View(df[df$council_district=="CITY TOTAL",])
df$council_district[df$council_district=="CITY TOTAL"] <- "City of Los Angeles"

# now relabel each council district
# go from council_district=1 --> council_district="Council District 1"
df$council_district <- sapply(df$council_district, function(cd) {
	if (nchar(cd)<3) {
		out <- paste0("Council District ", cd)
	} else {
		out <- cd
	}
	return(out)
})

# the "locality" variable as it is now is no longer of interest
# replace the "locality" column with the "council_district" column, then delete the latter
df$locality <- df$council_district
df <- df[,-which(colnames(df)=="council_district")]

write.csv(df, 'EconomyPanel.csv', row.names=F)