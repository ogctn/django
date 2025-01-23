export const gameConfig = {
  wssUrl: "ws://localhost:3949",
  ships: [
    {
      "geometries": [
        {
          "uuid": "b13285b0-d448-422e-a695-752d52ebd4aa",
          "type": "BoxGeometry",
          "width": 1,
          "height": 1,
          "depth": 1,
          "widthSegments": 1,
          "heightSegments": 1,
          "depthSegments": 1
        }
      ],
      "materials": [
        {
          "uuid": "1f047288-5e7f-458d-8114-e34513e27fc1",
          "type": "MeshPhysicalMaterial",
          "color": 16777215,
          "roughness": 1,
          "metalness": 0,
          "emissive": 2,
          "envMapRotation": [
            0,
            0,
            0,
            "XYZ"
          ],
          "envMapIntensity": 1,
          "blendColor": 0
        }
      ],
      "object": {
        "uuid": "5eb31a2b-19c5-4066-b900-3c717f9daad7",
        "type": "Mesh",
        "name": "Box",
        "layers": 1,
        "matrix": [
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1
        ],
        "up": [
          0,
          1,
          0
        ],
        "geometry": "b13285b0-d448-422e-a695-752d52ebd4aa",
        "material": "1f047288-5e7f-458d-8114-e34513e27fc1"
      }
    },
  ],
  scenes: [
    {
      name: "Test Scene",
      lights: [
      ],
      assets: [],
      children: [
        {
          "geometries": [
            {
              "uuid": "b13285b0-d448-422e-a695-752d52ebd4aa",
              "type": "BoxGeometry",
              "width": 1,
              "height": 1,
              "depth": 1,
              "widthSegments": 1,
              "heightSegments": 1,
              "depthSegments": 1
            }
          ],
          "materials": [
            {
              "uuid": "1f047288-5e7f-458d-8114-e34513e27fc1",
              "type": "MeshPhysicalMaterial",
              "color": 16777215,
              "roughness": 1,
              "metalness": 0,
              "emissive": 0,
              "side": 2,
              "envMapRotation": [
                0,
                0,
                0,
                "XYZ"
              ],
              "envMapIntensity": 1,
              "blendColor": 0
            }
          ],
          "object": {
            "uuid": "5eb31a2b-19c5-4066-b900-3c717f9daad7",
            "type": "Mesh",
            "name": "Box",
            "layers": 1,
            "matrix": [
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1
            ],
            "up": [
              0,
              1,
              0
            ],
            "geometry": "b13285b0-d448-422e-a695-752d52ebd4aa",
            "material": "1f047288-5e7f-458d-8114-e34513e27fc1"
          }
        },
        {
          "geometries": [
            {
              "uuid": "b13285b0-d448-422e-a695-752d52ebd4aa",
              "type": "BoxGeometry",
              "width": 1,
              "height": 1,
              "depth": 1,
              "widthSegments": 1,
              "heightSegments": 1,
              "depthSegments": 1
            }],
          "materials": [
            {
              "uuid": "1f047288-5e7f-458d-8114-e34513e27fc1",
              "type": "MeshPhysicalMaterial",
              "color": 16777215,
              "roughness": 1,
              "metalness": 0,
              "side": 2,
              "emissive": 0,
              "envMapRotation": [0, 0, 0,
                "XYZ"],
              "envMapIntensity": 1,
              "blendColor": 0
            }],
          "object": {
            "uuid": "5eb31a2b-19c5-4066-b900-3c717f9daad7",
            "type": "Mesh",
            "name": "Box",
            "layers": 1,
            "matrix": [
              1, 0, 0, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              0, 0, 1.32774326222044, 1],
            "up": [0, 1, 0],
            "geometry": "b13285b0-d448-422e-a695-752d52ebd4aa",
            "material": "1f047288-5e7f-458d-8114-e34513e27fc1"
          }
        },
        {
          "geometries": [
            {
              "uuid": "4d24eccc-c9ec-4392-9240-2677239a5ef7",
              "type": "TetrahedronGeometry",
              "radius": 1,
              "detail": 0
            }],
          "materials": [
            {
              "uuid": "38b7591c-0061-4e6b-a099-a9e7a99c2fd8",
              "type": "MeshPhysicalMaterial",
              "color": 16777215,
              "roughness": 1,
              "metalness": 0,
              "side": 2,
              "emissive": 0,
              "envMapRotation": [0, 0, 0,
                "XYZ"],
              "envMapIntensity": 1,
              "blendColor": 0
            }],
          "object": {
            "uuid": "d8a0f553-d8b7-4f67-8f18-5933948fe59e",
            "type": "Mesh",
            "name": "Tetrahedron",
            "layers": 1,
            "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1.4074349995822328, 0, 0, 1],
            "up": [0, 1, 0],
            "geometry": "4d24eccc-c9ec-4392-9240-2677239a5ef7",
            "material": "38b7591c-0061-4e6b-a099-a9e7a99c2fd8"
          }
        }
      ],
    },
    {
      name: "Match",
      lights: [
        {
          "type": "AmbientLight",
          "color": "white",
          "intensity": .1
        },
        {
          type: "PointLight",
          color: "yellow",
          intensity: 1,
          position: [0, -5, 0],
        },
        {
          type: "PointLight",
          color: "yellow",
          intensity: 1,
          position: [0, 7, -5],
        },
        {
          type: "PointLight",
          color: "red",
          intensity: 1,
          position: [4, 7, -10],
        },
        {
          type: "PointLight",
          color: "blue",
          intensity: 1,
          position: [-4, -5, 10],
        }
      ],
      assets: [
        {
          type: "texture",
          key: "luminaris_diffuse",
          url: "/assets/materials/luminaris_diffuse.tga"
        },
        {
          type: "texture",
          key: "luminaris_emissive",
          url: "/assets/materials/luminaris_emissive.tga"
        },
        {
          type: "texture",
          key: "luminaris_normal",
          url: "/assets/materials/luminaris_normal.tga"
        },
        {
          type: "texture",
          key: "luminaris_roughness",
          url: "/assets/materials/luminaris_roughness.tga"
        },
        {
          type: "texture",
          key: "luminaris_specular",
          url: "/assets/materials/luminaris_specular.tga"
        },
        {
          type: "model",
          key: "luminaris_model",
          url: "/assets/objects/luminaris.obj"
        },
      ]
    }
  ]
}