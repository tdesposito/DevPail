# Changelog

All notable changes to this project will be documented in this file.

* The format is based on [Keep a Changelog](https://keepachangelog.com/)
* This project adheres to [Semantic Versioning](https://semver.org/)
* This project uses [cvbump](https://github.com/tdesposito/ChangelogVersionTool) to maintain this changelog.

## [2.1.0](https://github.com/tdesposito/DevPail/releases/tag/v2.1.0) - 2022-02-18

### Added

* Add pycache redirection ([7042399](https://github.com/tdesposito/DevPail/commit/704239975f206f5220b3b48a3deb24f429a76b5a) by Todd Esposito)

### Fixed

* Fixed compiler/css/sass to watch subdirs ([80e2c8f](https://github.com/tdesposito/DevPail/commit/80e2c8f0ca6e117e2788b4662e582f0361b1b814) by Todd Esposito)
* Fixed metatask config to replace rather than merge the defaults ([c82543c](https://github.com/tdesposito/DevPail/commit/c82543ccd49c6e768e8c4ed8f363d3497ec08357) by Todd Esposito)

### Other Updates

* Updated init dir list - `deploy` no longer needed ([3a81900](https://github.com/tdesposito/DevPail/commit/3a819003e250d2f76b8260d95273950fed7f4ca7) by Todd Esposito)

## [2.0.0](https://github.com/tdesposito/DevPail/releases/tag/v2.0.0) - 2022-01-27

### Added

* Added "cvbump" task for changelog and versioning ([ae21494](https://github.com/tdesposito/DevPail/commit/ae214947d309685c1bc1e369fca8d37b53cc55df) by Todd Esposito)
* Added .serverlessrc to the list of bundled secrets ([8df6160](https://github.com/tdesposito/DevPail/commit/8df61602a70167283ff44e903a74cf924c8dfbeb) by Todd Esposito)
* Added support for "metatasks" ([6009be2](https://github.com/tdesposito/DevPail/commit/6009be252cbfb951861573b58a7767db29463172) by Todd Esposito)
  <br>_- revised the inbuild "build" task_
  <br>_- created a default "build" metatask_
  <br>_- revised the inbuild "clean" task_
  <br>_- created a default "clean" metatask_
  <br>_- misc refactors_
* Added AWS Lambda plugin ([1870c91](https://github.com/tdesposito/DevPail/commit/1870c91fb02fc1e29f88b916bd0c2c3b1fe3fdb2) by Todd Esposito)
* Added more configuration options to AWS EB ([4f29b8c](https://github.com/tdesposito/DevPail/commit/4f29b8c4c25d4c0d8c9a9b2e9a7f6b1c824a763f) by Todd Esposito)
* Added support for simplified compiler/server specs ([c577b03](https://github.com/tdesposito/DevPail/commit/c577b03430c0a6633cd568e489cbcf62313d8e86) by Todd Esposito)
  <br>_You can now list compilers/servers without config as just the plugin name_
* Added cwd hash to project name ([77ce227](https://github.com/tdesposito/DevPail/commit/77ce227d31a7c76a8be87bd9d8090bee28934276) by Todd Esposito)
  <br>_This avoids volume-name collisions for projects sharing a folder name_
* Added load-balancer config support to aws-eb ([497589c](https://github.com/tdesposito/DevPail/commit/497589cd6f14f7759140298ebc55f8c973bb9481) by Todd Esposito)
* Added copy-files plugin ([26c9882](https://github.com/tdesposito/DevPail/commit/26c98821a0c700925c4e947e89c7d89bc533295b) by Todd Esposito)
* Added tests for react plugin ([0aca8b1](https://github.com/tdesposito/DevPail/commit/0aca8b13cf079e45b9c91930aa6ad9a81180625d) by Todd Esposito)
* Add to basic test for imagemin plugin ([36e6d39](https://github.com/tdesposito/DevPail/commit/36e6d39f0725f7945ddc6a3a21f7fb4a54f175bb) by Todd Esposito)
* Added 'serve-static' task to serve the as-built app ([319da0f](https://github.com/tdesposito/DevPail/commit/319da0fc96c36447c1d38b11ce23f9aecaa42931) by Todd Esposito)
* Added aws-eb deployment task ([87caf22](https://github.com/tdesposito/DevPail/commit/87caf22b8a48d96bbc610532e96767f5a7414e95) by Todd Esposito)
* Added s3 setup feature. ([599d024](https://github.com/tdesposito/DevPail/commit/599d0240fd0919da977a7b08ef307966f51ee56b) by Todd Esposito)
  <br>_Naming and executing a task named like "*:setup" will create your hosting bucket._
* Added cli --cdn option ([93971b7](https://github.com/tdesposito/DevPail/commit/93971b7fc6c49eb7ce88013ea10d7fe3714125cd) by Todd Esposito)
  <br>_Running `devpail --cdn` now serves the locally installed plugins._
* Add "imagemin" compiler ([aac09bd](https://github.com/tdesposito/DevPail/commit/aac09bd3b532ac7c18a761b662de869d5e7836cd) by Todd Esposito)
* Add version/help options to the cli ([a19545e](https://github.com/tdesposito/DevPail/commit/a19545ef1e7c77fbd07c664ed275b0e67f4dd337) by Todd Esposito)
* Add aws-s3 deploy task ([a9f66ce](https://github.com/tdesposito/DevPail/commit/a9f66ced744233bab1ee9bb1363265f1102e1f5e) by Todd Esposito)
* Add .env injection ([cc890bc](https://github.com/tdesposito/DevPail/commit/cc890bcbde5c885917966d3ec64abf12da823dd4) by Todd Esposito)
* Added "lastRun" optimizations ([c71fa89](https://github.com/tdesposito/DevPail/commit/c71fa89044f39b7294d9396ade469ce8bb1f8e7f) by Todd Esposito)
* Add dependancy handling and building ([40f76fd](https://github.com/tdesposito/DevPail/commit/40f76fd99a5526c008f27858a3cd469707aa95b8) by Todd Esposito)
  <br>_- remember which dependancies have already been installed_
  <br>_- add the `build` task_
  <br>_- update the build tasks for the compilers_

### Fixed

* Fixed webpack-missing-process/path ([29bea41](https://github.com/tdesposito/DevPail/commit/29bea41c5daa233ecb85510153aceac819b75d32) by Todd Esposito)
* Fixed proxy and react plugins to support hybrids ([1596c32](https://github.com/tdesposito/DevPail/commit/1596c324544f4ef60a2aa3102d6dd9a6b9ed2768) by Todd Esposito)
* Fix --cdn to listen on 0.0.0.0 ([75d6921](https://github.com/tdesposito/DevPail/commit/75d69215f3cfe0ceb949affc374017d8b61d676f) by Todd Esposito)
* Fixed flask plugin (multiple fixes) ([cb69e4b](https://github.com/tdesposito/DevPail/commit/cb69e4b4a1a114aa51e83c4219d1adcad62e4638) by Todd Esposito)
  <br>_Fixed async-complete by properly return a task, rather than executing it_
  <br>_Refactored files extensions - DRY and simpler code_
  <br>_Removed the obsolete "roots" stuff_
  <br>_Added "seeding" so the server can start before the first sync completes_
  <br>_Added "isProxied" configuration parameter for Flask-as-a-backend configs_
* Fix "flattening" of homedir ([002c175](https://github.com/tdesposito/DevPail/commit/002c175135ae7480a49c724f20eccb598b1ae47e) by Todd Esposito)
* fix async-complete issues ([f2cd25d](https://github.com/tdesposito/DevPail/commit/f2cd25df67ba21f6564b05e0c6b0ca85f5fb2494) by Todd Esposito)
  <br>_the compilers now properly return a task, rather than executing it._
* fix potential error in error trap ([6efeca5](https://github.com/tdesposito/DevPail/commit/6efeca5f5b39def693fb65ebf8be9999f9d1c66d) by Todd Esposito)
* Fixed poetry config ([8a9fdd1](https://github.com/tdesposito/DevPail/commit/8a9fdd1395ecaaea6d8601a95966c26d822d668b) by Todd Esposito)
  <br>_Poetry now configured to build a venv in the devpail volume._
* Fix build pipeline ([e4a5dc2](https://github.com/tdesposito/DevPail/commit/e4a5dc22c3878a56febd21ecb9bc00ff3ee76d30) by Todd Esposito)
* Fix typo ([2d9957b](https://github.com/tdesposito/DevPail/commit/2d9957bedc1e2b660c103d1a6e955792c341d27f) by Todd Esposito)

### Other Updates

* Updated readme with links and a few more details ([6eadfd5](https://github.com/tdesposito/DevPail/commit/6eadfd55c7c50bec486bbd05ba4010a3c7c2e229) by Todd Esposito)
* Updated cvbump configuration ([1488d71](https://github.com/tdesposito/DevPail/commit/1488d7165383208a18b837a363c2582adba36539) by Todd Esposito)
* Updated default CDN url to v2 ([0e46401](https://github.com/tdesposito/DevPail/commit/0e4640171168495996a86f54fe2554c1a5bafdaf) by Todd Esposito)
* Update sass plugin test for "gulp" keys ([08fb618](https://github.com/tdesposito/DevPail/commit/08fb618079509188ba4992d22323a5de185510d4) by Todd Esposito)
* Update test for flask plugin ([8574505](https://github.com/tdesposito/DevPail/commit/8574505585c825e3a57b014a51956b9addaaa5fe) by Todd Esposito)
* Updated dependencies for new "build" process ([66a2e55](https://github.com/tdesposito/DevPail/commit/66a2e55b56816b0998b3df2fea8c2b5717e5d4fb) by Todd Esposito)
  <br>_This should have been commited with 71c247c411d7d94e98d89bdd87ef6d4534d8f5d5. Oops._
* Update build process to include secrets. ([71c247c](https://github.com/tdesposito/DevPail/commit/71c247c411d7d94e98d89bdd87ef6d4534d8f5d5) by Todd Esposito)
  <br>_The build process now adds your SSH keys, AWS credentials and Git configuration to the image._
* Updated the plugin system ([2647a9d](https://github.com/tdesposito/DevPail/commit/2647a9deced9d8c74b2079bb985dd31139e6cd0e) by Todd Esposito)
  <br>_Removed the "plugin-type" param for better flexibility;_
  <br>_Removed the "roots" - these don't need to be configurable;_
  <br>_Chnaged the key indicating the plugin path to "gulp" in all cases;_
  <br>_Suppressed pip's location warnings - they're incorrect;_
* update gitignore with node_modules ([b55e80e](https://github.com/tdesposito/DevPail/commit/b55e80e69de0ff2138f143d039387e59a370cbb8) by Todd Esposito)
* update docs for tests ([123f82a](https://github.com/tdesposito/DevPail/commit/123f82a22aff4d26e56fcc742a5c821b73c3a47a) by Todd Esposito)
* update gitignore for .env ([ff8d6a2](https://github.com/tdesposito/DevPail/commit/ff8d6a2a3744a5f70dd8cd675fea1678bb071f2e) by Todd Esposito)
* update clean:dev to display rather than throw and error ([e50456f](https://github.com/tdesposito/DevPail/commit/e50456fff8fb023483ff26e9c722342245799bf1) by Todd Esposito)
* Update tests 'basic' and 'sass' ([b059a08](https://github.com/tdesposito/DevPail/commit/b059a083056ba6caa054a3601a2e6621ec3c62ce) by Todd Esposito)

## 1.0.0

This release was prematurely called 1.x and should have been 0.1.0.

## Notes

None at this time.
