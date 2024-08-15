#!/bin/bash

## Helper functions
to_kebab_case() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-'
}

to_pascal_case() {
    local input="$1"
    input=$(echo "$input" | sed -e 's/--*/-/g' -e 's/-/ /g')
    input=$(echo "$input" | sed 's/^ *//;s/ *$//')
    input=$(echo "$input" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | tr -d ' ')
    echo "$input"
}

check_error() {
  if [ $? -ne 0 ]; then
    echo "An error occurred: $1"
    exit 1
  fi
}

SOURCE_FILE="src/routes/index.ts"


#####################################################################


## Prompt the new route
read -p "Enter the route name: " route_name
route_file_name=$(to_kebab_case "$route_name")
route_component_name=$(to_pascal_case "$route_name")

# Check if there is already a file with the same name
if [ -f "./src/routes/$route_file_name.vue" ]; then
  echo "Error: There is already a path with this name. Please pick a different name and try again."
  exit 1
fi

## Prompt /url
bold=$(tput bold)
normal=$(tput sgr0)
read -p "Enter the URL path (${bold}default${normal}: /$route_file_name): " url_path
url_path=${url_path:-/$route_file_name}
if [[ $url_path != /* ]]; then
  url_path="/$url_path"
fi

# Copy and rename the `_template.vue` file
cp ./src/routes/_template.vue ./src/routes/$route_file_name.vue
check_error "Failed to copy and rename the template file."

# Replace [route_name] within this template with the provided route_name
sed -i '' "s/\[route_name\]/$route_name/g" ./src/routes/$route_file_name.vue
check_error "Failed to replace [route_name] in the new file."


#####################################################################


## Gather imports from routes/index file
imports=$(awk '/import .* from/ {print $0}' "$SOURCE_FILE")
check_error "Failed to extract import statements from index.ts."
route_import="import ${route_component_name} from \"./$route_file_name.vue\""
echo -e "${imports}\n${route_import}" | sort > sorted_imports


## Gather routes from routes/index file
route_entry="
    {
        path: \"$url_path\",
        name: \"$route_name\",
        component: $route_component_name,
    },"

sed -n '/const routes = \[/,/^\]/ {
  /^[ \t]*const routes = \[/d
  /^\]/d
  p
}' "$SOURCE_FILE" > routes_temp
sed '/^[[:space:]]*$/d' routes_temp > routes_temp2.txt
printf "%s," "$(cat routes_temp2.txt)" > routes_temp.txt 


{
    cat routes_temp.txt 
    echo "    $route_entry"
} > routes_temp2.txt 

flattened_string=$(sed 's/},/😡/g' "routes_temp2.txt")
flattened_string=$(echo "$flattened_string" | tr '\n' '🍺')
flattened_string=$(echo "$flattened_string" | sed 's/    {//g')
flattened_string=$(echo "$flattened_string" | sed 's/,🍺    😡/😡/g')
flattened_string=$(echo "$flattened_string" | sed 's/\}🍺//g')
flattened_string=$(echo "$flattened_string" | sed 's/    /\t/g')
flattened_string=$(echo "$flattened_string" | sed 's/\t🍺/🍺/g')
echo "$flattened_string" | tr '😡' '\n' | grep -v '^$' | sort > "routes_temp.txt"
sed 's/🍺🍺/\t\},\n\t\{\n/g' routes_temp.txt > routes_temp2.txt
sed 's/🍺/\n/g' routes_temp2.txt > routes_temp
tail -n +2 "routes_temp" | awk 'NR==1{print "\t{"; print $0} NR>1{print} END{print "\t}"}' > "routes_temp.txt"
sed '/^[[:space:]]*$/d' routes_temp.txt > sorted_routes

# Clean up
rm "routes_temp"
rm "routes_temp.txt"
rm "routes_temp2.txt"


## Get remaining content from routes/index

awk '
/const routes = \[/ { in_block=1; found_routes=1; next }
found_routes && /^\]/ { in_block=0; next }
found_routes && !in_block { print }
' "$SOURCE_FILE" > remaining_data


#####################################################################


## Combine the three sections, and overwrite the routes/index.ts file

{
    cat sorted_imports
    echo ""
    echo "const routes = ["
    cat sorted_routes | expand -t 4
    echo "]"
    cat remaining_data
} > $SOURCE_FILE


## Clean-up temp files
rm sorted_imports
rm sorted_routes
rm remaining_data

echo "Route ${bold}$route_name${normal} added successfully!"
