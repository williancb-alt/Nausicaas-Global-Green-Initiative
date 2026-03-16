# This file is maintained automatically by "terraform init".
# Manual edits may be lost in future updates.

provider "registry.terraform.io/gavinbunney/kubectl" {
  version     = "1.19.0"
  constraints = ">= 1.14.0"
  hashes = [
    "h1:quymfa/OKEfWI5JXFEwGbUY2aAy0vet3rA9JWJam+3k=",
    "zh:1dec8766336ac5b00b3d8f62e3fff6390f5f60699c9299920fc9861a76f00c71",
    "zh:43f101b56b58d7fead6a511728b4e09f7c41dc2e3963f59cf1c146c4767c6cb7",
    "zh:4c4fbaa44f60e722f25cc05ee11dfaec282893c5c0ffa27bc88c382dbfbaa35c",
    "zh:51dd23238b7b677b8a1abbfcc7deec53ffa5ec79e58e3b54d6be334d3d01bc0e",
    "zh:5afc2ebc75b9d708730dbabdc8f94dd559d7f2fc5a31c5101358bd8d016916ba",
    "zh:6be6e72d4663776390a82a37e34f7359f726d0120df622f4a2b46619338a168e",
    "zh:72642d5fcf1e3febb6e5d4ae7b592bb9ff3cb220af041dbda893588e4bf30c0c",
    "zh:9b12af85486a96aedd8d7984b0ff811a4b42e3d88dad1a3fb4c0b580d04fa425",
    "zh:a1da03e3239867b35812ee031a1060fed6e8d8e458e2eaca48b5dd51b35f56f7",
    "zh:b98b6a6728fe277fcd133bdfa7237bd733eae233f09653523f14460f608f8ba2",
    "zh:bb8b071d0437f4767695c6158a3cb70df9f52e377c67019971d888b99147511f",
    "zh:dc89ce4b63bfef708ec29c17e85ad0232a1794336dc54dd88c3ba0b77e764f71",
    "zh:dd7dd18f1f8218c6cd19592288fde32dccc743cde05b9feeb2883f37c2ff4b4e",
    "zh:ec4bd5ab3872dedb39fe528319b4bba609306e12ee90971495f109e142d66310",
    "zh:f610ead42f724c82f5463e0e71fa735a11ffb6101880665d93f48b4a67b9ad82",
  ]
}

provider "registry.terraform.io/hashicorp/azurerm" {
  version     = "3.116.0"
  constraints = "~> 3.116.0"
  hashes = [
    "h1:BCR3NIorFSvGG3v/+JOiiw3VM4PkChLO4m84wzD9NDo=",
    "zh:02b6606aff025fc2a962b3e568e000300abe959adac987183c24dac8eb057f4d",
    "zh:2a23a8ce24ff9e885925ffee0c3ea7eadba7a702541d05869275778aa47bdea7",
    "zh:57d10746384baeca4d5c56e88872727cdc150f437b8c5e14f0542127f7475e24",
    "zh:59e3ebde1a2e1e094c671e179f231ead60684390dbf02d2b1b7fe67a228daa1a",
    "zh:5f1f5c7d09efa2ee8ddf21bd9efbbf8286f6e90047556bef305c062fa0ac5880",
    "zh:a40646aee3c9907276dab926e6123a8d70b1e56174836d4c59a9992034f88d70",
    "zh:c21d40461bc5836cf56ad3d93d2fc47f61138574a55e972ad5ff1cb73bab66dc",
    "zh:c56fb91a5ae66153ba0f737a26da1b3d4f88fdef7d41c63e06c5772d93b26953",
    "zh:d1e60e85f51d12fc150aeab8e31d3f18f859c32f927f99deb5b74cb1e10087aa",
    "zh:ed35e727e7d79e687cd3d148f52b442961ede286e7c5b4da1dcd9f0128009466",
    "zh:f569b65999264a9416862bca5cd2a6177d94ccb0424f3a4ef424428912b9cb3c",
    "zh:f6d2a4e7c58f44e7d04a4a9c73f35ed452f412c97c85def68c4b52814cbe03ab",
  ]
}

provider "registry.terraform.io/hashicorp/helm" {
  version     = "2.17.0"
  constraints = "~> 2.13"
  hashes = [
    "h1:kQMkcPVvHOguOqnxoEU2sm1ND9vCHiT8TvZ2x6v/Rsw=",
    "zh:06fb4e9932f0afc1904d2279e6e99353c2ddac0d765305ce90519af410706bd4",
    "zh:104eccfc781fc868da3c7fec4385ad14ed183eb985c96331a1a937ac79c2d1a7",
    "zh:129345c82359837bb3f0070ce4891ec232697052f7d5ccf61d43d818912cf5f3",
    "zh:3956187ec239f4045975b35e8c30741f701aa494c386aaa04ebabffe7749f81c",
    "zh:66a9686d92a6b3ec43de3ca3fde60ef3d89fb76259ed3313ca4eb9bb8c13b7dd",
    "zh:88644260090aa621e7e8083585c468c8dd5e09a3c01a432fb05da5c4623af940",
    "zh:a248f650d174a883b32c5b94f9e725f4057e623b00f171936dcdcc840fad0b3e",
    "zh:aa498c1f1ab93be5c8fbf6d48af51dc6ef0f10b2ea88d67bcb9f02d1d80d3930",
    "zh:bf01e0f2ec2468c53596e027d376532a2d30feb72b0b5b810334d043109ae32f",
    "zh:c46fa84cc8388e5ca87eb575a534ebcf68819c5a5724142998b487cb11246654",
    "zh:d0c0f15ffc115c0965cbfe5c81f18c2e114113e7a1e6829f6bfd879ce5744fbb",
    "zh:f569b65999264a9416862bca5cd2a6177d94ccb0424f3a4ef424428912b9cb3c",
  ]
}

provider "registry.terraform.io/hashicorp/kubernetes" {
  version     = "2.38.0"
  constraints = "~> 2.30"
  hashes = [
    "h1:soK8Lt0SZ6dB+HsypFRDzuX/npqlMU6M0fvyaR1yW0k=",
    "zh:0af928d776eb269b192dc0ea0f8a3f0f5ec117224cd644bdacdc682300f84ba0",
    "zh:1be998e67206f7cfc4ffe77c01a09ac91ce725de0abaec9030b22c0a832af44f",
    "zh:326803fe5946023687d603f6f1bab24de7af3d426b01d20e51d4e6fbe4e7ec1b",
    "zh:4a99ec8d91193af961de1abb1f824be73df07489301d62e6141a656b3ebfff12",
    "zh:5136e51765d6a0b9e4dbcc3b38821e9736bd2136cf15e9aac11668f22db117d2",
    "zh:63fab47349852d7802fb032e4f2b6a101ee1ce34b62557a9ad0f0f0f5b6ecfdc",
    "zh:924fb0257e2d03e03e2bfe9c7b99aa73c195b1f19412ca09960001bee3c50d15",
    "zh:b63a0be5e233f8f6727c56bed3b61eb9456ca7a8bb29539fba0837f1badf1396",
    "zh:d39861aa21077f1bc899bc53e7233262e530ba8a3a2d737449b100daeb303e4d",
    "zh:de0805e10ebe4c83ce3b728a67f6b0f9d18be32b25146aa89116634df5145ad4",
    "zh:f569b65999264a9416862bca5cd2a6177d94ccb0424f3a4ef424428912b9cb3c",
    "zh:faf23e45f0090eef8ba28a8aac7ec5d4fdf11a36c40a8d286304567d71c1e7db",
  ]
}

provider "registry.terraform.io/hashicorp/time" {
  version     = "0.13.1"
  constraints = "~> 0.9"
  hashes = [
    "h1:ZT5ppCNIModqk3iOkVt5my8b8yBHmDpl663JtXAIRqM=",
    "zh:02cb9aab1002f0f2a94a4f85acec8893297dc75915f7404c165983f720a54b74",
    "zh:04429b2b31a492d19e5ecf999b116d396dac0b24bba0d0fb19ecaefe193fdb8f",
    "zh:26f8e51bb7c275c404ba6028c1b530312066009194db721a8427a7bc5cdbc83a",
    "zh:772ff8dbdbef968651ab3ae76d04afd355c32f8a868d03244db3f8496e462690",
    "zh:78d5eefdd9e494defcb3c68d282b8f96630502cac21d1ea161f53cfe9bb483b3",
    "zh:898db5d2b6bd6ca5457dccb52eedbc7c5b1a71e4a4658381bcbb38cedbbda328",
    "zh:8de913bf09a3fa7bedc29fec18c47c571d0c7a3d0644322c46f3aa648cf30cd8",
    "zh:9402102c86a87bdfe7e501ffbb9c685c32bbcefcfcf897fd7d53df414c36877b",
    "zh:b18b9bb1726bb8cfbefc0a29cf3657c82578001f514bcf4c079839b6776c47f0",
    "zh:b9d31fdc4faecb909d7c5ce41d2479dd0536862a963df434be4b16e8e4edc94d",
    "zh:c951e9f39cca3446c060bd63933ebb89cedde9523904813973fbc3d11863ba75",
    "zh:e5b773c0d07e962291be0e9b413c7a22c044b8c7b58c76e8aa91d1659990dfb5",
  ]
}
