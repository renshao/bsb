require 'crxmake'

task :default => [:package]

task :package do
# create zip for Google Extension Gallery
CrxMake.zip(
  :ex_dir => ".",
  :pkey   => "../webstand.pem",
  :zip_output => "webstand.zip",
  :verbose => true,
  :ignorefile => /^\..+/,
  :ignoredir => /^(\..+)|test$/
)
end
