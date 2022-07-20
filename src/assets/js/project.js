import * as dat from 'dat.gui'
import { vhCalc } from './utils'
import Grid, { convertJSONToHTML } from './grid'
import projectData from './../json/project.json'

const gui = new dat.GUI({ closeOnTop: false })

window.onload = () => {
	vhCalc()
	new Grid({
		gui,
		hasDynamicTitle: false
	})
	convertJSONToHTML(projectData.medias)
}
