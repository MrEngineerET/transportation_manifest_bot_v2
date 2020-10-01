const fs = require('fs')
const path = require('path')

let imageName = ['sheldon.jpg', 'haward.jpg', 'leonard.jpg']
let ids = [311770091, 32145, 12345]
const personal = JSON.parse(
	fs.readFileSync(path.join(__dirname, '..', 'dev_data', 'personal.json'))
)

for (let i = 0; i < 3; i++) {
	let sheldonPicManual = path.join(__dirname, '..', 'dev_data', 'images', imageName[i])

	const sheldonRecordIndex = personal.findIndex(entry => entry.id == ids[i])
	const sheldonRecord = personal[sheldonRecordIndex]

	sheldonRecord.image = sheldonPicManual
	personal[sheldonRecordIndex] = sheldonRecord
}
fs.writeFileSync(path.join(__dirname, '..', 'dev_data', 'personal.json'), JSON.stringify(personal))
