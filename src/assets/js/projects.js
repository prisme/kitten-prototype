import * as dat from 'dat.gui'
import { vhCalc } from './utils'
import Grid, { convertJSONToHTML } from './grid'
import Menu from './menu'
import projectData from './../json/projects.json'

const gui = new dat.GUI({ closeOnTop: false })

window.onload = () => {
	vhCalc()
	new Menu()
	new Grid({
		gui,
		hasDynamicTitle: true
	})
	// convertJSONToHTML(projectData.medias)
}
