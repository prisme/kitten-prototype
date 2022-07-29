import { vhCalc } from './utils'
import Grid, { convertJSONToHTML } from './grid'
import Menu from './menu'
import projectData from './../json/project.json'

window.onload = () => {
	vhCalc()
	new Menu()
	new Grid({
		hasDynamicTitle: false,
	})
	// convertJSONToHTML(projectData.medias)
}
