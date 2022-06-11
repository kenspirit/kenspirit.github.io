destination=../../public/nodeppt/

build_files=$(cat buildlist.txt | xargs)

for file in $build_files
do
    # echo $file
    nodeppt build ./$file -d $destination
done
