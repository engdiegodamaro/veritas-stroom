"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- Componentes SVG Inline (Ícones Lucide-React-like) ---

const Loader2 = ({ className = "h-5 w-5", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`} {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

const RefreshCcw = ({ className = "h-5 w-5", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M3 2v6h6" />
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.79 2.91L3 8" />
        <path d="M21 22v-6h-6" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.79-2.91L3 16" />
    </svg>
);

const AlertTriangle = ({ className = "h-5 w-5", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="m21.73 18.06-8.21-14.22a2 2 0 0 0-3.44 0L2.27 18.06a2 2 0 0 0 1.72 3.01h16.02a2 2 0 0 0 1.72-3.01Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const Filter = ({ className = "w-4 h-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const ChevronDown = ({ className = "w-4 h-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const X = ({ className = "h-6 w-6", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const Check = ({ className = "h-4 w-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const Plus = ({ className = "h-5 w-5", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M12 5v14" /><path d="M5 12h14" />
    </svg>
);

const Pencil = ({ className = "h-4 w-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="M15 5l4 4" />
    </svg>
);

const Trash2 = ({ className = "h-4 w-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
);

// Configurações e constantes
const STATUS_COLORS = {
    'Agendado': { color: 'bg-gray-400', tailwind: 'bg-gray-400', hex: '#9CA3AF' },
    'Concluído': { color: 'bg-green-500', tailwind: 'bg-green-500', hex: '#10B981' },
    'Atrasado': { color: 'bg-red-600', tailwind: 'bg-red-600', hex: '#DC2626' },
    // 'Realizado' é um status cru que vira 'Concluído' no cálculo
    'Realizado': { color: 'bg-green-500', tailwind: 'bg-green-500', hex: '#10B981' }, 
};

// Status a serem exibidos na legenda e no filtro (Calculados) 
const LEGEND_STATUSES = Object.entries(STATUS_COLORS)
    .filter(([status]) => ['Agendado', 'Concluído', 'Atrasado'].includes(status));


const MONTH_MAP = {
    'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4, 'Maio': 5, 'Junho': 6,
    'Julho': 7, 'Agosto': 8, 'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
};
const MONTHS = Object.keys(MONTH_MAP);

const ACTIVITY_HEIGHT = 28; 
const ROW_VERTICAL_PADDING = 12; 
const MIN_ROW_HEIGHT = 40; 

/**
 * Normaliza uma string (remove espaços extras e converte para maiúsculas) para comparação em filtros.
 */
const normalizeText = (str) => {
    if (typeof str !== 'string' || str === '') return null;
    return str.trim().toUpperCase();
};

/**
 * Extrai o ano de uma string no formato 'Mês Ano'.
 */
const extractYear = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split(' ');
    const year = parseInt(parts[1], 10);
    return isNaN(year) ? null : year;
};

/**
 * Converte a string 'Mês Ano' para um objeto Date no primeiro dia do mês.
 */
const parseMonthYearToDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split(' ');
    const mesStr = parts[0];
    const ano = parseInt(parts[1], 10);
    const mesNum = MONTH_MAP[mesStr]; 
    if (!mesNum || isNaN(ano)) return null;
    return new Date(ano, mesNum - 1, 1);
};


/**
 * Calcula o status final (Concluído, Agendado, Atrasado).
 */
const getCalculatedStatus = (activity) => {
    const rawStatus = normalizeText(activity.status);
    const startDate = parseMonthYearToDate(activity.inicio);
    
    if (!startDate) return null; 
    
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    if (rawStatus === 'REALIZADO') {
        return 'Concluído';
    }
    
    if (rawStatus === 'AGENDADO') {
        // Regra do Atrasado: Agendado e data de início é anterior ao mês atual
        if (startDate < currentMonthStart) {
            return 'Atrasado'; 
        }
        return 'Agendado';
    }
    
    return null; 
};


/**
 * Calcula a posição de início da barra (mês) dentro do contexto anual.
 */
const calculateMonthIndex = (dateString, startYear) => {
    if (!dateString) return null;
    const parts = dateString.split(' ');
    const ano = parseInt(parts[1], 10);
    const mesNum = MONTH_MAP[parts[0]]; 

    if (!mesNum || isNaN(ano) || ano !== startYear) return null;

    return mesNum - 1; // Índice do mês (0-11)
};


// --- Componente Modal de Detalhes (Atualizado com CRUD) ---

const GanttDetailModal = ({ activity, onClose, onEdit, onDelete }) => {
    if (!activity) return null;
    
    const finalStatus = getCalculatedStatus(activity);
    const { tailwind: statusClass } = STATUS_COLORS[finalStatus] || STATUS_COLORS['Agendado'];
    
    const DetailRow = ({ label, value, isStatus = false }) => (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className={`text-sm font-semibold ${isStatus ? statusClass.replace('bg-', 'text-') : 'text-gray-800'}`}>
                {value}
            </span>
        </div>
    );

    return (
        // Overlay de Fundo
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            
            {/* Modal Card */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100" 
                onClick={e => e.stopPropagation()} 
            >
                <header className={`p-4 rounded-t-xl ${statusClass} flex justify-between items-center`}>
                    <h2 className="text-xl font-bold text-white truncate pr-6">Detalhes: {activity.atividade}</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-white hover:bg-white hover:text-gray-900 transition-colors opacity-80 hover:opacity-100"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="p-6">
                    <div className="space-y-4">
                        {/* MELHORIA DE NOMENCLATURA: Local/Usina */}
                        <DetailRow label="Usina/Local (UFVS)" value={activity.local || 'N/A'} />
                        {/* MELHORIA DE NOMENCLATURA: Estado/UF */}
                        <DetailRow label="UF" value={activity.estado || 'N/A'} />
                        <DetailRow label="Início Previsto" value={activity.inicio || 'N/A'} />
                        <DetailRow label="Status Atual" value={activity.status || 'N/A'} />
                    </div>
                    
                    {/* Botões de CRUD Adicionados */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button 
                            onClick={() => { onClose(); onDelete(activity); }}
                            className="flex items-center px-3 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </button>
                        <button 
                            onClick={() => { onClose(); onEdit(activity); }}
                            className="flex items-center px-3 py-2 text-sm font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};


// --- Componente Modal de Confirmação de Exclusão ---

const DeleteConfirmationModal = ({ activity, onConfirm, onCancel, isDeleting }) => {
    if (!activity) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-100" 
                onClick={e => e.stopPropagation()} 
            >
                <header className="p-4 rounded-t-xl bg-red-600 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
                    <button onClick={onCancel} className="p-1 rounded-full text-white hover:bg-white hover:text-red-600 transition-colors opacity-80 hover:opacity-100"><X className="h-5 w-5" /></button>
                </header>

                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        Você tem certeza que deseja excluir a atividade **"{activity.atividade}"** em **{activity.local}**? Esta ação é irreversível.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={onCancel} 
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => onConfirm(activity.id)} 
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:bg-red-400 disabled:shadow-none flex items-center"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            {isDeleting ? 'Excluindo...' : 'Excluir Atividade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Componente Modal de Formulário (CREATE/UPDATE) ---
const STATUS_OPTIONS = ['Agendado', 'Realizado']; 

const ActivityFormModal = ({ 
    activityToEdit, 
    uniqueLocals, 
    uniqueStates, 
    uniqueActivities, 
    onClose, 
    onSubmit,
    isSubmitting
}) => {
    // activityToEdit será null para criação e o objeto da atividade para edição.
    const isEdit = !!activityToEdit; 
    
    // Calcula o estado inicial, puxando os dados da atividade se estiver em modo de edição
    const initialMonth = isEdit ? activityToEdit.inicio.split(' ')[0] : MONTHS[new Date().getMonth()];
    const initialYear = isEdit ? activityToEdit.inicio.split(' ')[1] : new Date().getFullYear().toString();
    
    // O estado inicial do formulário é populado com os dados da atividade (activityToEdit)
    const [formData, setFormData] = useState({
        // No modo de edição, esses campos são imutáveis, mas mantidos para o modo de criação.
        local: activityToEdit?.local || (uniqueLocals.length > 0 ? uniqueLocals[0] : ''),
        estado: activityToEdit?.estado || (uniqueStates.length > 0 ? uniqueStates[0] : ''),
        atividade: activityToEdit?.atividade || (uniqueActivities.length > 0 ? uniqueActivities[0] : ''), 
        // CAMPOS QUE O USUÁRIO PODE EDITAR:
        status: activityToEdit?.status || 'Agendado',
        mes: initialMonth,
        ano: initialYear,
    });
    
    // Cria as opções de ano (Ano atual + 4)
    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());
    }, [currentYear]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Se for edição, os campos Local, Estado e Atividade devem vir dos valores originais
        // para garantir que apenas Status e Início sejam alterados no PUT.
        const payload = {
            ...(isEdit && { id: activityToEdit.id }), 
            local: isEdit ? activityToEdit.local : formData.local,
            estado: isEdit ? activityToEdit.estado : formData.estado,
            atividade: isEdit ? activityToEdit.atividade : formData.atividade,
            status: formData.status,
            inicio: `${formData.mes} ${formData.ano}`, // Mês Ano para o route.js
        };

        onSubmit(payload, isEdit);
    };
    

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100" 
                onClick={e => e.stopPropagation()} 
            >
                <header className={`p-4 rounded-t-xl ${isEdit ? 'bg-blue-600' : 'bg-green-600'} flex justify-between items-center`}>
                    <h2 className="text-xl font-bold text-white">
                        {isEdit ? 'Editar Atividade' : 'Incluir Nova Atividade'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-white hover:text-gray-900 transition-colors opacity-80 hover:opacity-100"><X className="h-5 w-5" /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Linha 1: Local e Estado */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* -------------------- CAMPO LOCAL -------------------- */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Usina/Local (UFVS)*</span>
                            {isEdit ? (
                                // Modo Edição: Apenas exibe o texto, com fundo cinza para indicar 'somente leitura'
                                <p className="mt-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 font-semibold">{activityToEdit.local}</p>
                            ) : (
                                // Modo Criação: Exibe o campo de seleção
                                <select 
                                    name="local"
                                    value={formData.local}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Selecione o local</option>
                                    {uniqueLocals.map(local => (
                                        <option key={local} value={local}>{local}</option>
                                    ))}
                                </select>
                            )}
                        </label>
                         {/* -------------------- CAMPO ESTADO -------------------- */}
                         <label className="block">
                            <span className="text-sm font-medium text-gray-700">UF*</span>
                            {isEdit ? (
                                // Modo Edição: Apenas exibe o texto, com fundo cinza para indicar 'somente leitura'
                                <p className="mt-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 font-semibold">{activityToEdit.estado}</p>
                            ) : (
                                // Modo Criação: Exibe o campo de seleção
                                <select 
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Selecione o estado</option>
                                    {uniqueStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            )}
                        </label>
                    </div>

                    {/* Linha 2: Atividade */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Descrição da Atividade*</span>
                        {isEdit ? (
                            // Modo Edição: Apenas exibe o texto, com fundo cinza para indicar 'somente leitura'
                            <p className="mt-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 font-semibold">{activityToEdit.atividade}</p>
                        ) : (
                            // Modo Criação: Exibe o campo de seleção
                            <select 
                                name="atividade"
                                value={formData.atividade}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="" disabled>Selecione a atividade</option>
                                {uniqueActivities.map(activity => (
                                    <option key={activity} value={activity}>{activity}</option>
                                ))}
                            </select>
                        )}
                    </label>

                    {/* Linha 3: Mês/Ano e Status (Campos de edição solicitados - PERMANECEM EDITÁVEIS) */}
                    <div className="grid grid-cols-3 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Mês Início*</span>
                            <select 
                                name="mes"
                                value={formData.mes} 
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {MONTHS.map(mes => (
                                    <option key={mes} value={mes}>{mes}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Ano Início*</span>
                             <select 
                                name="ano"
                                value={formData.ano} 
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-gray-700">Status*</span>
                            <select 
                                name="status"
                                value={formData.status} 
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center px-6 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors 
                                ${isEdit 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400' 
                                    : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'} flex items-center justify-center`}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2" /> : null}
                            <span className="ml-1">
                                {isSubmitting 
                                    ? (isEdit ? 'Salvando...' : 'Criando...') 
                                    : (isEdit ? 'Salvar Alterações' : 'Incluir Atividade')}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Componente para renderizar a barra de atividade no gráfico Gantt
const GanttBar = ({ activity, currentYear, verticalIndex, onBarClick }) => {
    const finalStatus = getCalculatedStatus(activity);
    if (finalStatus === null) return null; 

    const monthIndex = calculateMonthIndex(activity.inicio, currentYear);
    if (monthIndex === null) return null; 

    const { tailwind: statusClass } = STATUS_COLORS[finalStatus]; 
    
    const totalMonths = 12;
    const startOffset = (monthIndex / totalMonths) * 100;
    const widthPercentage = (1 / totalMonths) * 100;

    const topOffset = (verticalIndex * ACTIVITY_HEIGHT) + (ROW_VERTICAL_PADDING / 2);

    return (
        <div 
            className={`absolute rounded-lg shadow-md transition-all duration-300 ease-out 
                ${statusClass} text-white group cursor-pointer 
                flex items-center justify-center p-0.5 border border-white/30 hover:shadow-xl hover:scale-[1.01]`}
            style={{ 
                left: `${startOffset}%`, 
                width: `${widthPercentage}%`, 
                minWidth: '10px', 
                height: `${ACTIVITY_HEIGHT - 4}px`, 
                top: `${topOffset}px`, 
                fontSize: '0.65rem', 
                fontWeight: '600'
            }}
            title={`${activity.atividade} (${finalStatus})`}
            onClick={() => onBarClick(activity)}
        >
            <span className="truncate text-center leading-tight max-w-full px-0.5" title={activity.atividade}>
                {activity.atividade}
            </span>
        </div>
    );
};

// Componente Dropdown de Seleção Múltipla (Para Filtros de Estado e Atividade)
const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayValue = useMemo(() => {
        if (selectedValues.length === 0) {
            return `Todos os ${label}s`;
        }
        if (selectedValues.length === options.length) {
            return `Todos os ${label}s (${options.length})`;
        }
        
        // CORREÇÃO SOLICITADA: Se for mais de um item, mostra a contagem e "Selecionados"
        if (selectedValues.length > 1) { 
            return `${selectedValues.length} Selecionados`; 
        }

        // Se for apenas 1, mostra o nome do item
        return selectedValues[0];
    }, [selectedValues, options, label]);
    
    const handleToggleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onClear();
        } else {
            // Garante que só opções válidas sejam adicionadas
            options.forEach(option => {
                if (!selectedValues.includes(option)) {
                    onToggle(option);
                }
            });
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center px-4 py-2 bg-white rounded-xl border transition-colors 
                            font-semibold text-sm shadow-sm hover:border-blue-300
                            ${selectedValues.length > 0 ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'}`}
                aria-expanded={isOpen}
            >
                <Filter className="w-3 h-3 mr-2" />
                <span>{displayValue}</span>
                <ChevronDown className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-30 mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 p-2 max-h-80 overflow-y-auto">
                    
                    {/* Botão Selecionar Todos/Nenhum */}
                    <button
                        onClick={handleToggleSelectAll}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-1 border-b border-gray-100"
                    >
                        {selectedValues.length === options.length ? 'Limpar Seleção' : 'Selecionar Todos'}
                        <Check className={`ml-2 h-4 w-4 ${selectedValues.length === options.length ? 'text-blue-500' : 'text-transparent'}`} />
                    </button>

                    {options.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        return (
                            <div
                                key={option}
                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors 
                                            ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => onToggle(option)}
                            >
                                <span>{option}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 text-blue-500" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Componente de Dropdown de Seleção Única (Com layout unificado)
const SingleSelectDropdown = ({ label, options, selectedValue, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayValue = useMemo(() => {
        if (!selectedValue || selectedValue === '') {
            return `Selecione o ${label}`;
        }
        return selectedValue;
    }, [selectedValue, label]);
    
    const handleOptionClick = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center px-4 py-2 bg-white rounded-xl border transition-colors 
                            font-semibold text-sm shadow-sm hover:border-blue-300
                            ${selectedValue ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'}`}
                aria-expanded={isOpen}
            >
                <Filter className="w-3 h-3 mr-2" />
                <span>{displayValue}</span>
                <ChevronDown className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-30 mt-2 w-48 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 p-2 max-h-80 overflow-y-auto">
                    
                    {options.map((option) => {
                        const isSelected = option === selectedValue;
                        return (
                            <div
                                key={option}
                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors 
                                            ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                <span>{option}</span>
                                {isSelected && <Check className="ml-2 h-4 w-4 text-blue-500" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


// Componente Principal do Gráfico Gantt 
const GanttChart = ({ 
    data, error, isLoading, 
    selectedYear, uniqueYears, onYearChange, 
    selectedStates, uniqueStates, onStateToggle, onStateClear, 
    selectedActivities, uniqueActivities, onActivityToggle, onActivityClear, 
    selectedStatuses, uniqueStatuses, onStatusToggle, onStatusClear, 
    onBarClick, preFilteredData 
}) => {
    const currentYearNum = parseInt(selectedYear, 10);
    
    const [hoveredLocal, setHoveredLocal] = useState(null);

    const today = new Date();
    const currentMonthIndex = today.getMonth(); // 0 a 11
    const currentCalendarYear = today.getFullYear();
    const isCurrentYearSelected = currentCalendarYear === currentYearNum; 


    // 2. Filtragem dos Dados: Por Ano, por Estado (UF), por Atividade e por Status
    const filteredData = useMemo(() => {
        if (!currentYearNum) return [];
        
        const stateFilterIsActive = selectedStates && selectedStates.length > 0;
        const normalizedSelectedStates = stateFilterIsActive ? new Set(selectedStates) : null;

        const activityFilterIsActive = selectedActivities && selectedActivities.length > 0;
        const normalizedSelectedActivities = activityFilterIsActive ? new Set(selectedActivities) : null;
        
        // NOVO: Status Filter
        const statusFilterIsActive = selectedStatuses && selectedStatuses.length > 0;
        const normalizedSelectedStatuses = statusFilterIsActive ? new Set(selectedStatuses) : null;


        return preFilteredData.filter(d => {
            const rawState = normalizeText(d.estado);
            const rawActivity = normalizeText(d.atividade);
            const calculatedStatus = getCalculatedStatus(d); // Usa o status calculado

            // Normaliza os valores de filtro para comparação
            const normalizedDState = normalizeText(d.estado);
            const normalizedDActivity = normalizeText(d.atividade);

            const matchesState = !stateFilterIsActive || (normalizedDState && normalizedSelectedStates.has(normalizedDState));
            const matchesActivity = !activityFilterIsActive || (normalizedDActivity && normalizedSelectedActivities.has(normalizedDActivity)); 
            
            // Verifica se o status calculado corresponde aos filtros
            const matchesStatus = !statusFilterIsActive || (calculatedStatus && normalizedSelectedStatuses.has(calculatedStatus));

            return extractYear(d.inicio) === currentYearNum && matchesState && matchesActivity && matchesStatus;
        });
    }, [preFilteredData, currentYearNum, selectedStates, selectedActivities, selectedStatuses]); 


    // 2. Extração dos Rótulos (Locais e Meses)
    const { uniqueLocals, timeLabels } = useMemo(() => {
        const locals = filteredData.map(d => d.local);
        const uniqueLocals = Array.from(new Set(locals)).sort();
        
        const labels = Object.keys(MONTH_MAP).map(monthName => `${monthName} ${selectedYear}`);
        
        return { uniqueLocals, timeLabels: labels };
    }, [filteredData, selectedYear]);

    // 3. Processamento para Empilhamento (Stacking) e Altura da Linha (rowHeight)
    const processedLocals = useMemo(() => {
        const localMap = {};
        
        uniqueLocals.forEach(local => {
            localMap[local] = {
                activities: [],
                maxStackDepth: 0,
            };
        });

        filteredData.forEach(activity => {
            const local = activity.local;
            if (!localMap[local]) return; 
            
            const monthIndex = calculateMonthIndex(activity.inicio, currentYearNum);
            if (monthIndex === null) return;
            
            const monthKey = `${local}-${monthIndex}`;
            
            if (!localMap[local].stackDepth) {
                localMap[local].stackDepth = {};
            }
            if (!localMap[local].stackDepth[monthKey]) {
                localMap[local].stackDepth[monthKey] = 0;
            }

            const verticalIndex = localMap[local].stackDepth[monthKey];
            activity.verticalIndex = verticalIndex;
            
            localMap[local].stackDepth[monthKey] += 1;
            
            localMap[local].maxStackDepth = Math.max(localMap[local].maxStackDepth, verticalIndex + 1);
            
            localMap[local].activities.push(activity);
        });

        return uniqueLocals.map(local => {
            const data = localMap[local];
            const maxDepth = data.maxStackDepth;
            const rowHeight = Math.max(MIN_ROW_HEIGHT, (maxDepth * ACTIVITY_HEIGHT) + ROW_VERTICAL_PADDING);

            return {
                local,
                activities: data.activities,
                rowHeight,
            };
        });

    }, [filteredData, currentYearNum, uniqueLocals]);

    if (isLoading) {
        return (
            <div className="flex flex-col w-full p-6 bg-white rounded-xl shadow-2xl mt-6 border border-gray-100 animate-pulse">
                <div className="flex justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex gap-3">
                        <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
                        <div className="h-8 bg-gray-200 rounded-xl w-32"></div>
                        <div className="h-8 bg-gray-200 rounded-xl w-40"></div>
                    </div>
                </div>
                <div className="h-10 bg-gray-100 rounded-t-lg"></div>
                <div className="grid grid-cols-[200px_1fr]">
                    {[...Array(5)].map((_, i) => (
                         <React.Fragment key={i}>
                            <div className="h-12 bg-gray-50 flex items-center justify-center border-r border-b border-gray-200">
                                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                            </div>
                            <div className="h-12 bg-white border-b border-gray-200 relative">
                                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 h-6 bg-blue-200 rounded-lg w-1/12"></div>
                                <div className="absolute top-1/2 left-1/3 transform -translate-y-1/2 h-6 bg-green-200 rounded-lg w-1/12"></div>
                            </div> 
                         </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl shadow-lg mt-8 border-2 border-red-500 p-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
                <p className="mt-3 text-xl font-bold text-red-700">Erro de Conexão ou Dados</p>
                <p className="text-sm text-gray-600 mt-2">
                    **Erro:** {error.error}
                </p>
                <p className="text-sm text-gray-600">
                    **Detalhes:** {error.details}
                </p>
            </div>
        );
    }
    
    if (data.length === 0) {
        return (
             <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-lg mt-8 border border-gray-200">
                <p className="text-xl font-semibold text-gray-700">Nenhum Dado de Cronograma Encontrado</p>
                <p className="text-gray-500 mt-2">Clique em 'Atualizar Dados' para carregar a informação.</p>
            </div>
        );
    }
    

    return (
        <div className="flex flex-col w-full p-6 bg-white rounded-xl shadow-2xl overflow-x-auto mt-6 border border-gray-100">
            
            {/* Cabeçalho do Gráfico, Legenda de Status e Filtros */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 pb-4 border-b border-gray-100">
                
                {/* Legenda de Status */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 md:mb-0">
                    <span className="text-sm font-bold text-gray-800 mr-2">Status:</span>
                    {LEGEND_STATUSES.map(([status, { tailwind }]) => (
                        <div key={status} className="flex items-center">
                            <span className={`w-3 h-3 ${tailwind} rounded-full mr-2 shadow-inner`}></span>
                            <span className="text-sm font-medium text-gray-700">{status}</span>
                        </div>
                    ))}
                </div>

                {/* Contêiner de Filtros */}
                <div className="flex flex-wrap gap-3 items-center">
                    
                    {/* Filtro Anual (Seleção Única - AGORA UNIFICADO) */}
                    <SingleSelectDropdown 
                        label="Ano"
                        selectedValue={selectedYear}
                        options={uniqueYears}
                        onChange={onYearChange}
                    />

                    {/* Filtro de Estado (UF) - MULTI-SELEÇÃO */}
                    <MultiSelectDropdown 
                        label="UF" 
                        options={uniqueStates}
                        selectedValues={selectedStates}
                        onToggle={onStateToggle} // Chamada para handleStateToggle
                        onClear={onStateClear} 
                    />

                    {/* Filtro de Atividade - MULTI-SELEÇÃO */}
                    <MultiSelectDropdown 
                        label="Atividade"
                        options={uniqueActivities}
                        selectedValues={selectedActivities} 
                        onToggle={onActivityToggle} // Chamada para handleActivityToggle
                        onClear={onActivityClear} 
                    />

                    {/* Filtro de Status - MULTI-SELEÇÃO */}
                    <MultiSelectDropdown 
                        label="Status"
                        options={uniqueStatuses} // Os 3 status calculados
                        selectedValues={selectedStatuses} 
                        onToggle={onStatusToggle} // Chamada para handleStatusToggle
                        onClear={onStatusClear} 
                    />
                </div>
            </div>

            {/* Mensagem se não houver dados no ano/estado filtrado */}
            {filteredData.length === 0 && (
                <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg mb-4 font-medium">
                    Nenhuma atividade encontrada para os filtros e ano selecionados.
                </div>
            )}


            {/* Layout do Gráfico Principal */}
            <div className="flex flex-col border border-gray-200 rounded-xl overflow-x-auto shadow-inner">
                
                {/* 1. HEADER FIXO (Rótulos de Coluna) */}
                <div className="grid grid-cols-[200px_1fr] h-10 flex-shrink-0 bg-gray-50" style={{ minWidth: '800px' }}>
                    
                    {/* Rótulo Usina (Fixo) */}
                    {/* MELHORIA DE NOMENCLATURA: Usina/Local */}
                    <div className="text-sm font-bold text-gray-700 flex items-center justify-center border-r border-gray-200">
                        Usina/Local
                    </div>
                    
                    {/* Rótulos de Mês */}
                    <div className="relative overflow-hidden w-full h-full"> 
                        <div className="flex h-full w-full"> 
                            {timeLabels.slice(0, 12).map((label, index) => (
                                <div 
                                    key={index} 
                                    className={`flex-shrink-0 flex items-center justify-center text-xs text-gray-800 font-semibold border-l border-gray-200 transition-colors duration-200
                                        ${isCurrentYearSelected && index === currentMonthIndex ? 'bg-blue-200/50 text-blue-900' : ''}
                                    `}
                                    style={{ width: `${100 / 12}%` }}
                                >
                                    {label.split(' ')[0].substring(0, 3).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. CONTEÚDO EXPANSÍVEL (Linhas de Atividades) */}
                <div className="grid grid-cols-[200px_1fr]" style={{ minWidth: '800px' }}> 

                    {/* Coluna de Rótulos (Eixo Y - Usina) */}
                    <div className="flex flex-col border-r border-gray-200">
                        {processedLocals.map(({ local, rowHeight }, index) => {
                            const isHovered = local === hoveredLocal;
                            return (
                                <div key={local} 
                                    style={{ height: `${rowHeight}px` }}
                                    className={`flex items-center justify-center text-sm font-medium transition-colors duration-200
                                        ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} 
                                        ${isHovered ? 'bg-blue-100/70 font-semibold text-blue-800' : 'text-gray-700'} 
                                        border-b border-gray-100`}
                                    title={`UF: ${filteredData.find(d => d.local === local)?.estado || ''}`}
                                    onMouseEnter={() => setHoveredLocal(local)}
                                    onMouseLeave={() => setHoveredLocal(null)}
                                >
                                    {local}
                                </div>
                            );
                        })}
                    </div>

                    {/* Coluna do Tempo (Linha do Tempo - Eixo X + Content) */}
                    <div className="relative overflow-hidden w-full"> 
                        <div className="relative w-full"> 
                            
                            
                            {/* Destaque do Mês Atual (permanece aqui, pois é um fundo para a área de meses) */}
                            {/* Apenas mantendo se for o ano atual */}
                            {isCurrentYearSelected && (
                                <div 
                                    className="absolute top-0 bottom-0 bg-blue-100/30 z-0 transition-all duration-200"
                                    style={{ 
                                        left: `${(currentMonthIndex / 12) * 100}%`,
                                        width: `${100 / 12}%`
                                    }}
                                ></div>
                            )}

                            {processedLocals.map(({ local, activities, rowHeight }, rowIndex) => {
                                const isHovered = local === hoveredLocal;
                                return (
                                    <div 
                                        key={local} 
                                        className={`relative w-full border-b border-gray-100 transition-colors duration-200`}
                                        style={{ height: `${rowHeight}px` }} 
                                        onMouseEnter={() => setHoveredLocal(local)}
                                        onMouseLeave={() => setHoveredLocal(null)}
                                    >
                                        {/* Fundo dinâmico para destaque da linha (considerando a faixa do mês atual) */}
                                        <div 
                                            className={`absolute inset-0 z-0 transition-colors duration-200 
                                                ${isHovered ? 'bg-blue-50/50' : (rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white')}`}
                                        ></div>
                                        
                                        {/* Linhas de Barras de Atividade */}
                                        <div className="relative z-10 w-full h-full">
                                            {activities.map((activity, activityIndex) => (
                                                <GanttBar 
                                                    key={activityIndex} 
                                                    activity={activity}
                                                    currentYear={currentYearNum} 
                                                    verticalIndex={activity.verticalIndex}
                                                    onBarClick={onBarClick}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Componente de Layout Principal
export default function App() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Estados do Filtro
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedStates, setSelectedStates] = useState([]); 
    const [selectedActivities, setSelectedActivities] = useState([]); 
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    
    // Estados do CRUD
    const [selectedActivityDetail, setSelectedActivityDetail] = useState(null); 
    // CORRIGIDO: Inicia como null. true para 'criar', objeto para 'editar'.
    const [activityToEdit, setActivityToEdit] = useState(null); 
    const [activityToDelete, setActivityToDelete] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [isDeleting, setIsDeleting] = useState(false); 

    // Função de busca de dados da API (Read)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/cronograma');
            const result = await response.json();

            if (!response.ok) {
                setError(result);
                setData([]);
            } else {
                setData(result.data);
                setError(null);
            }
        } catch (err) {
            setError({ error: 'Erro de Rede', details: err.message });
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Submissão do Formulário (POST ou PUT)
    const handleFormSubmit = useCallback(async (payload, isEdit) => {
        setIsSubmitting(true);
        setError(null);

        const method = isEdit ? 'PUT' : 'POST';
        const url = '/api/cronograma'; 

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                setError({ 
                    error: `Falha ao ${isEdit ? 'atualizar' : 'criar'} atividade.`, 
                    details: result.details || result.error 
                });
            } else {
                // Sucesso: Fechar modal e recarregar dados
                setActivityToEdit(null); 
                setSelectedActivityDetail(null);
                await fetchData();
            }
        } catch (err) {
            setError({ error: 'Erro de Rede', details: err.message });
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);

    // Execução da Exclusão (DELETE)
    const handleDeleteExecute = useCallback(async (id) => {
        setIsDeleting(true);
        setError(null);

        try {
            const response = await fetch('/api/cronograma', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const result = await response.json();
                setError({ 
                    error: 'Falha ao excluir atividade.', 
                    details: result.details || result.error 
                });
            } else {
                // Sucesso: Fechar modal e recarregar dados
                setActivityToDelete(null);
                await fetchData();
            }
        } catch (err) {
            setError({ error: 'Erro de Rede', details: err.message });
        } finally {
            setIsDeleting(false);
        }
    }, [fetchData]);

    // Manipuladores de Abertura de Modais
    // CORRIGIDO: Define como TRUE para forçar a abertura do modal em modo criação
    const handleOpenCreate = () => setActivityToEdit(true); 
    const handleOpenEdit = (activity) => setActivityToEdit(activity);
    const handleDeleteConfirm = (activity) => setSelectedActivityDetail(null) || setActivityToDelete(activity);


    // Busca inicial de dados
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- Dados calculados para Filtros e Formulário ---
    
    // Filtra apenas dados com status válido
    const preFilteredData = useMemo(() => {
        return data.filter(d => getCalculatedStatus(d) !== null);
    }, [data]);
    
    // Extrai e ordena os anos únicos
    const uniqueYears = useMemo(() => {
        const years = preFilteredData.map(d => extractYear(d.inicio)).filter(y => y && !isNaN(y));
        const unique = Array.from(new Set(years)).sort((a, b) => a - b).map(y => y.toString());
        return unique;
    }, [preFilteredData]);

    // Extrai e ordena os locais (UFVS) únicos - AGORA DISPONÍVEL PARA O FORMULÁRIO
    const uniqueLocals = useMemo(() => {
        const locals = preFilteredData
            .map(d => d.local)
            .filter(l => l);
        return Array.from(new Set(locals)).sort();
    }, [preFilteredData]);

    // Extrai e ordena os estados (UF) únicos 
    const uniqueStates = useMemo(() => {
        const states = preFilteredData
            .map(d => d.estado)
            .filter(s => s);
        return Array.from(new Set(states)).sort();
    }, [preFilteredData]);

    // Extrai e ordena as atividades únicas
    const uniqueActivities = useMemo(() => {
        const activities = preFilteredData
            .map(d => d.atividade)
            .filter(a => a);
        return Array.from(new Set(activities)).sort();
    }, [preFilteredData]);
    
    // Extrai e ordena os status únicos (os calculados: Agendado, Concluído, Atrasado)
    const uniqueStatuses = useMemo(() => {
        return LEGEND_STATUSES.map(([status]) => status).sort();
    }, []); 

    // Efeito para definir o ANO ATUAL como padrão
    useEffect(() => {
        if (uniqueYears.length > 0 && selectedYear === '') {
            const currentCalendarYear = new Date().getFullYear().toString();
            
            if (uniqueYears.includes(currentCalendarYear)) {
                setSelectedYear(currentCalendarYear);
            } else {
                setSelectedYear(uniqueYears[uniqueYears.length - 1]);
            }
        }
    }, [uniqueYears, selectedYear]);
    
    // --- Handlers de Filtro (Funções Específicas e Robustas) ---
    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    const handleStateToggle = (state) => {
        setSelectedStates(prev => {
            const normalizedState = normalizeText(state);
            // Compara o estado normalizado para evitar duplicatas por case/espaço
            if (prev.includes(normalizedState)) {
                return prev.filter(s => s !== normalizedState);
            } else {
                return [...prev, normalizedState];
            }
        });
    };
    
    const handleStateClear = () => {
        setSelectedStates([]);
    };

    // Handlers para Atividade (Multi-Select)
    const handleActivityToggle = (activity) => {
        setSelectedActivities(prev => {
            const normalizedActivity = normalizeText(activity);
            if (prev.includes(normalizedActivity)) {
                return prev.filter(a => a !== normalizedActivity);
            } else {
                return [...prev, normalizedActivity];
            }
        });
    };
    
    const handleActivityClear = () => {
        setSelectedActivities([]);
    };

    // Handlers para Status (Multi-Select)
    const handleStatusToggle = (status) => {
        setSelectedStatuses(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const handleStatusClear = () => {
        setSelectedStatuses([]);
    };
    
    // Handler para abrir o modal de detalhes
    const handleBarClick = (activity) => {
        setSelectedActivityDetail(activity);
    };

    // Handler para fechar o modal de detalhes
    const handleCloseDetailModal = () => {
        setSelectedActivityDetail(null);
    };
    
    // Handler para fechar o modal de formulário
    const handleCloseFormModal = () => {
        setActivityToEdit(null); 
    };
    
    // Handler para fechar o modal de exclusão
    const handleCloseDeleteModal = () => {
        setActivityToDelete(null);
    };


    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Cronograma de Atividades - Cliente Élis Energia
                    </h1>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex space-x-3">
                    
                    {/* Botão para Incluir Atividade no Cronograma */}
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg 
                                    hover:bg-green-700 transition duration-300 font-semibold shadow-md"
                        title="Adicionar uma nova atividade ao cronograma"
                    >
                         <Plus className="h-4 w-4 mr-2" />
                        <span className="text-sm">Incluir Atividade</span>
                    </button>
                    
                    {/* Botão de Atualizar Dados (Recarregar) */}
                    <button
                        onClick={fetchData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg 
                                    hover:bg-blue-700 transition duration-300 font-semibold shadow-md 
                                    disabled:bg-gray-400 disabled:shadow-none"
                        disabled={isLoading}
                        title="Recarregar dados do Supabase"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2" />
                        ) : (
                            <RefreshCcw className="h-4 w-4 mr-2" />
                        )}
                        <span className="text-sm">{isLoading ? 'Atualizando...' : 'Atualizar Dados'}</span>
                    </button>
                </div>
            </header>

            {/* Mensagem de Erro de API (Global) */}
            {error && (
                <div className="p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg mb-4 font-medium flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span className="text-sm">{error.error} ({error.details})</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Renderiza o Gráfico Gantt completo com filtros */}
            <GanttChart 
                data={data} 
                error={error} 
                isLoading={isLoading} 
                selectedYear={selectedYear}
                uniqueYears={uniqueYears}
                onYearChange={handleYearChange}
                selectedStates={selectedStates} 
                // Passa o handler explicitamente definido para evitar erros de escopo
                uniqueStates={uniqueStates.map(normalizeText).filter(Boolean)}   
                onStateToggle={handleStateToggle} 
                onStateClear={handleStateClear} 
                selectedActivities={selectedActivities} 
                // Passa o handler explicitamente definido para evitar erros de escopo
                uniqueActivities={uniqueActivities.map(normalizeText).filter(Boolean)}
                onActivityToggle={handleActivityToggle} 
                onActivityClear={handleActivityClear} 
                selectedStatuses={selectedStatuses} 
                // Passa o handler explicitamente definido para evitar erros de escopo
                uniqueStatuses={uniqueStatuses}
                onStatusToggle={handleStatusToggle}
                onStatusClear={handleStatusClear}
                onBarClick={handleBarClick} 
                preFilteredData={preFilteredData} 
            />

            {/* Modal de Detalhes da Atividade (Abre ao clicar na barra) */}
            <GanttDetailModal 
                activity={selectedActivityDetail} 
                onClose={handleCloseDetailModal} 
                onEdit={handleOpenEdit} 
                onDelete={handleDeleteConfirm} 
            />
            
            {/* Modal de Formulário (CREATE/UPDATE) */}
            {/* O modal abre se activityToEdit não for null (objeto para edição, true para criação) */}
            {activityToEdit !== null && (
                <ActivityFormModal
                    // Se for 'true' (modo de criação), passa null. Se for objeto, passa o objeto (modo edição)
                    activityToEdit={activityToEdit === true ? null : activityToEdit} 
                    // Passa as listas de opções normalizadas
                    uniqueLocals={uniqueLocals.map(normalizeText).filter(Boolean)} 
                    uniqueStates={uniqueStates.map(normalizeText).filter(Boolean)}
                    uniqueActivities={uniqueActivities.map(normalizeText).filter(Boolean)}
                    onClose={handleCloseFormModal}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                />
            )}

            {/* Modal de Confirmação de Exclusão (DELETE) */}
            <DeleteConfirmationModal 
                activity={activityToDelete}
                onConfirm={handleDeleteExecute}
                onCancel={handleCloseDeleteModal}
                isDeleting={isDeleting}
            />


            {/* Rodapé Adicionado */}
            <footer className="mt-10 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                    Interface Profissional de Gerenciamento de Cronogramas | Desenvolvido por Stroom.
                </p>
            </footer>
        </main>
    );
}