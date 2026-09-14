export function resolverImagem(url, arquivos, ano, indice) {
	if (/^https?:\/\//.test(url)) return url;
	const nome = url.split('/').pop();
	const correspondente = arquivos?.find((f) => f.endsWith(`/${nome}`) || f === url);
	if (correspondente) return correspondente;
	return `https://enem.dev/${ano}/questions/${indice}/${nome}`;
}

export function renderMarkdownInline(texto) {
	const partes = [];
	const regex = /(\*\*[^*]+\*\*)|(^|[^A-Za-z0-9À-ÿ])(_([^_]+)_)(?=$|[^A-Za-z0-9À-ÿ])/g;
	let restante = texto;
	let m;
	let chave = 0;
	regex.lastIndex = 0;
	while ((m = regex.exec(restante))) {
		if (m.index > 0) partes.push(restante.slice(0, m.index));
		if (m[1] !== undefined) {
			partes.push(<strong key={`n${chave++}`}>{m[1].slice(2, -2)}</strong>);
			restante = restante.slice(m.index + m[1].length);
		} else {
			if (m[2]) partes.push(m[2]);
			partes.push(<em key={`i${chave++}`}>{m[4]}</em>);
			restante = restante.slice(m.index + m[0].length);
		}
		regex.lastIndex = 0;
	}
	if (restante) partes.push(restante);
	return partes;
}

export function blocosDoContexto(questao) {
	const { context, files, year: ano, index } = questao;
	const blocos = [];
	const regexImagem = /!\[[^\]]*\]\(([^)]+)\)/g;
	let restante = context?.trim();
	let m;
	regexImagem.lastIndex = 0;
	while (restante && (m = regexImagem.exec(restante))) {
		if (m.index > 0) blocos.push({ tipo: 'texto', valor: restante.slice(0, m.index) });
		blocos.push({ tipo: 'imagem', valor: resolverImagem(m[1], files, ano, index) });
		restante = restante.slice(m.index + m[0].length);
		regexImagem.lastIndex = 0;
	}
	if (restante?.trim()) blocos.push({ tipo: 'texto', valor: restante });

	const usadas = new Set(blocos.filter((b) => b.tipo === 'imagem').map((b) => b.valor));
	(files ?? []).forEach((f) => {
		if (!usadas.has(f)) blocos.push({ tipo: 'imagem', valor: f });
	});

	return blocos;
}