## UPLOAD WEBSITE ##

# This script should be run from the top level directory:
# > ./scripts/upload-website.sh 

upload_to_s3 () {
  # recursively delete all .DS_Store files
  find . -name '.DS_Store' -type f -delete

  # upload built files to s3

  # index html
  aws s3 cp dist/index.html s3://$1/index.html --content-type 'text/html; charset=utf-8'

  # remove old built files before uploading new ones
  aws s3 rm s3://$1/dist --recursive

  # js files
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'application/javascript; charset=utf-8' \
    --exclude '*' \
    --include '*.js' \
    --exclude '*.json' # exclude json files which match '*.js'
  # css files
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'text/css; charset=utf-8' \
    --exclude '*' \
    --include '*.css'
  # json files
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'application/json; charset=utf-8' \
    --exclude '*' \
    --include '*.json'
  # png files
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'image/png' \
    --exclude '*' \
    --include '*.png'
  # svg files
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'image/svg+xml' \
    --exclude '*' \
    --include '*.svg'
  # ico files (favicon)
  aws s3 cp dist s3://$1/dist --recursive \
    --content-type 'image/vnd.microsoft.icon' \
    --exclude '*' \
    --include '*.ico'

  # TODO get this to work
  # only upload new/modified media files
  # aws s3 sync media s3://$1/media
}

# same as S3_BUCKET_NAME_FILE in cloudfront-stack.ts
S3_BUCKET_NAME_FILE="./output-s3-bucket-name"

# get built files
# TODO in a future version, this script would handle building the website files
BUILT_FILES_DIR=built-files
rm -rf $BUILT_FILES_DIR
mkdir $BUILT_FILES_DIR
cp -R ~/Dropbox/website/dist $BUILT_FILES_DIR

# run cdk to create an S3 bucket with a unique name, and rest of infra for serving website files
cdk synth
cdk deploy
S3_BUCKET_NAME=$(cat $S3_BUCKET_NAME_FILE)

# upload files to S3
echo "upload_to_s3 $S3_BUCKET_NAME"
cd $BUILT_FILES_DIR
upload_to_s3 $S3_BUCKET_NAME
