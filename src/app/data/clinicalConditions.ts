// Clinical Index - Complete data structure for conditions and patterns
// Each condition can have optional patterns with associated formulas

export interface ClinicalPattern {
  name: string;
  formulas: string[];
}

export interface ClinicalCondition {
  name: string;
  category: 'western' | 'tcm';
  patterns?: ClinicalPattern[];
  formulas?: string[]; // For conditions without patterns
}

export const CLINICAL_CONDITIONS: ClinicalCondition[] = [
  // 1. Abdominal pain - WITH PATTERNS
  { 
    name: 'Abdominal pain', 
    category: 'western',
    patterns: [
      { name: 'Cold', formulas: ['Liang Fu Wan', 'Da Huang Fu Zi Tang'] },
      { name: 'Heat', formulas: ['Da Cheng Qi Tang', 'Xiao Cheng Qi Tang'] },
      { name: 'Deficiency and cold', formulas: ['Xiao Jian Zhong Tang', 'Da Jian Zhong Tang', 'Fu Zi Li Zhong Wan'] },
      { name: 'Qi stagnation', formulas: ['Chai Hu Shu Gan San', 'Si Ni San'] },
      { name: 'Blood stagnation', formulas: ['Shao Fu Zhu Yu Tang'] },
      { name: 'Food stagnation', formulas: ['Bao He Wan', 'Zhi Shi Dao Zhi Wan'] },
    ]
  },
  
  // 2. Acid reflux - WITH PATTERNS
  { 
    name: 'Acid reflux', 
    category: 'western',
    patterns: [
      { name: 'Heat', formulas: ['Zuo Jin Wan'] },
      { name: 'Cold', formulas: ['Xiang Sha Liu Jun Zi Tang'] },
    ]
  },
  
  // 3. Acne - WITHOUT PATTERNS (direct formulas)
  { 
    name: 'Acne', 
    category: 'western',
    formulas: ['Qing Shang Fang Feng Tang', 'Huang Lian Shang Qing Wan', 'Jing Jie Lian Qiao Tang', 'Shi Wei Bai Du Tang', 'Wu Wei Xiao Du Yin']
  },
  
  // 4. Adrenocortical insufficiency (Addison's disease) - WITH PATTERNS
  { 
    name: "Adrenocortical insufficiency (Addison's disease)", 
    category: 'western',
    patterns: [
      { name: 'Qi deficiency', formulas: ['Shi Quan Da Bu Tang'] },
    ]
  },
  
  // 5. Anxiety - WITH PATTERNS
  { 
    name: 'Anxiety', 
    category: 'western',
    patterns: [
      { name: 'Heart Blood Deficiency', formulas: ['Gui Pi Tang', 'Tian Wang Bu Xin Dan'] },
      { name: 'Liver Qi Stagnation', formulas: ['Xiao Yao San', 'Chai Hu Shu Gan San'] },
      { name: 'Phlegm Heat', formulas: ['Wen Dan Tang', 'Huang Lian Wen Dan Tang'] },
    ]
  },
  
  // 6. Arthritis - WITH PATTERNS
  { 
    name: 'Arthritis', 
    category: 'western',
    patterns: [
      { name: 'Cold Dampness', formulas: ['Juan Bi Tang', 'Wu Tou Tang'] },
      { name: 'Damp Heat', formulas: ['Xuan Bi Tang', 'Bai Hu Jia Gui Zhi Tang'] },
      { name: 'Blood Stasis', formulas: ['Shen Tong Zhu Yu Tang', 'Huo Luo Xiao Ling Dan'] },
      { name: 'Qi and Blood Deficiency', formulas: ['Du Huo Ji Sheng Tang', 'Huang Qi Gui Zhi Wu Wu Tang'] },
    ]
  },
  
  // 7. Asthma - WITH PATTERNS
  { 
    name: 'Asthma', 
    category: 'western',
    patterns: [
      { name: 'Cold Phlegm', formulas: ['Xiao Qing Long Tang', 'She Gan Ma Huang Tang'] },
      { name: 'Heat Phlegm', formulas: ['Ding Chuan Tang', 'Ma Xing Shi Gan Tang'] },
      { name: 'Lung Qi Deficiency', formulas: ['Bu Fei Tang', 'Yu Ping Feng San'] },
      { name: 'Kidney Yang Deficiency', formulas: ['Jin Gui Shen Qi Wan', 'Shen Ge San'] },
    ]
  },
  
  // 8. Common Cold - WITHOUT PATTERNS
  { 
    name: 'Common Cold', 
    category: 'western',
    formulas: ['Gui Zhi Tang', 'Ma Huang Tang', 'Yin Qiao San', 'Sang Ju Yin']
  },
  
  // 9. Cough - WITH PATTERNS
  { 
    name: 'Cough', 
    category: 'western',
    patterns: [
      { name: 'Wind Cold', formulas: ['Xing Su San', 'Zhi Sou San'] },
      { name: 'Wind Heat', formulas: ['Sang Ju Yin', 'Sang Xing Tang'] },
      { name: 'Dry', formulas: ['Sang Xing Tang', 'Qing Zao Jiu Fei Tang'] },
      { name: 'Phlegm Dampness', formulas: ['Er Chen Tang', 'San Zi Yang Qin Tang'] },
      { name: 'Phlegm Heat', formulas: ['Qing Qi Hua Tan Wan', 'Xiao Xian Xiong Tang'] },
      { name: 'Lung Yin Deficiency', formulas: ['Bai He Gu Jin Tang', 'Yang Yin Qing Fei Tang'] },
    ]
  },
  
  // 10. Depression - WITH PATTERNS
  { 
    name: 'Depression', 
    category: 'western',
    patterns: [
      { name: 'Liver Qi Stagnation', formulas: ['Xiao Yao San', 'Chai Hu Shu Gan San'] },
      { name: 'Heart Blood Deficiency', formulas: ['Gui Pi Tang', 'Yang Xin Tang'] },
      { name: 'Kidney Yang Deficiency', formulas: ['You Gui Wan', 'Jin Gui Shen Qi Wan'] },
      { name: 'Phlegm Misting the Mind', formulas: ['Wen Dan Tang', 'Di Tan Tang'] },
    ]
  },
  
  // 11. Eczema - WITH PATTERNS
  { 
    name: 'Eczema', 
    category: 'western',
    patterns: [
      { name: 'Damp Heat', formulas: ['Long Dan Xie Gan Tang', 'Xiao Feng San'] },
      { name: 'Blood Deficiency', formulas: ['Si Wu Tang', 'Dang Gui Yin Zi'] },
      { name: 'Wind Heat', formulas: ['Xiao Feng San', 'Qing Ying Tang'] },
    ]
  },
  
  // 12. Fever - WITHOUT PATTERNS
  { 
    name: 'Fever', 
    category: 'western',
    formulas: ['Bai Hu Tang', 'Qing Hao Bie Jia Tang', 'Qing Ying Tang', 'Xi Jiao Di Huang Tang']
  },
  
  // 13. Headache - WITH PATTERNS
  { 
    name: 'Headache', 
    category: 'western',
    patterns: [
      { name: 'Wind Cold', formulas: ['Chuan Xiong Cha Tiao San', 'Wu Zhu Yu Tang'] },
      { name: 'Wind Heat', formulas: ['Sang Ju Yin', 'Chuan Xiong Cha Tiao San'] },
      { name: 'Liver Yang Rising', formulas: ['Tian Ma Gou Teng Yin', 'Long Dan Xie Gan Tang'] },
      { name: 'Blood Stasis', formulas: ['Xue Fu Zhu Yu Tang', 'Tong Qiao Huo Xue Tang'] },
      { name: 'Qi and Blood Deficiency', formulas: ['Shi Quan Da Bu Tang', 'Ba Zhen Tang'] },
    ]
  },
  
  // 14. Hypertension - WITH PATTERNS
  { 
    name: 'Hypertension', 
    category: 'western',
    patterns: [
      { name: 'Liver Yang Rising', formulas: ['Tian Ma Gou Teng Yin', 'Zhen Gan Xi Feng Tang'] },
      { name: 'Liver Fire', formulas: ['Long Dan Xie Gan Tang', 'Dang Gui Long Hui Wan'] },
      { name: 'Kidney Yin Deficiency', formulas: ['Liu Wei Di Huang Wan', 'Zhi Bai Di Huang Wan'] },
      { name: 'Phlegm Dampness', formulas: ['Ban Xia Bai Zhu Tian Ma Tang', 'Wen Dan Tang'] },
    ]
  },
  
  // 15. Insomnia - WITH PATTERNS
  { 
    name: 'Insomnia', 
    category: 'western',
    patterns: [
      { name: 'Heart Blood Deficiency', formulas: ['Gui Pi Tang', 'Suan Zao Ren Tang'] },
      { name: 'Yin Deficiency Heat', formulas: ['Huang Lian E Jiao Tang', 'Tian Wang Bu Xin Dan'] },
      { name: 'Liver Fire', formulas: ['Long Dan Xie Gan Tang', 'Zuo Jin Wan'] },
      { name: 'Phlegm Heat', formulas: ['Wen Dan Tang', 'Huang Lian Wen Dan Tang'] },
    ]
  },
  
  // 16. IBS (Irritable Bowel Syndrome) - WITH PATTERNS
  { 
    name: 'IBS', 
    category: 'western',
    patterns: [
      { name: 'Spleen Qi Deficiency', formulas: ['Si Jun Zi Tang', 'Bu Zhong Yi Qi Tang'] },
      { name: 'Liver Qi Stagnation', formulas: ['Xiao Yao San', 'Tong Xie Yao Fang'] },
      { name: 'Damp Heat', formulas: ['Ge Gen Qin Lian Tang', 'Shao Yao Tang'] },
      { name: 'Cold Dampness', formulas: ['Huo Xiang Zheng Qi San', 'Li Zhong Wan'] },
    ]
  },
  
  // 17. Menopausal Symptoms - WITH PATTERNS
  { 
    name: 'Menopausal Symptoms', 
    category: 'western',
    patterns: [
      { name: 'Kidney Yin Deficiency', formulas: ['Liu Wei Di Huang Wan', 'Zhi Bai Di Huang Wan'] },
      { name: 'Kidney Yang Deficiency', formulas: ['You Gui Wan', 'Jin Gui Shen Qi Wan'] },
      { name: 'Liver Qi Stagnation', formulas: ['Xiao Yao San', 'Dan Zhi Xiao Yao San'] },
      { name: 'Heart Kidney Not Harmonized', formulas: ['Tian Wang Bu Xin Dan', 'Jiao Tai Wan'] },
    ]
  },
  
  // 18. Migraine - WITH PATTERNS
  { 
    name: 'Migraine', 
    category: 'western',
    patterns: [
      { name: 'Liver Yang Rising', formulas: ['Tian Ma Gou Teng Yin'] },
      { name: 'Blood Stasis', formulas: ['Xue Fu Zhu Yu Tang', 'Tong Qiao Huo Xue Tang'] },
      { name: 'Liver Fire', formulas: ['Long Dan Xie Gan Tang'] },
      { name: 'Qi and Blood Deficiency', formulas: ['Ba Zhen Tang'] },
    ]
  },
  
  // 19. Nausea - WITHOUT PATTERNS
  { 
    name: 'Nausea', 
    category: 'western',
    formulas: ['Xiao Ban Xia Tang', 'Ban Xia Hou Po Tang', 'Wu Ling San', 'Xiang Sha Liu Jun Zi Tang']
  },
  
  // TCM SYNDROME CONDITIONS
  
  // 20. Bi Syndrome (Painful Obstruction) - WITH PATTERNS
  { 
    name: 'Bi Syndrome (Painful Obstruction)', 
    category: 'tcm',
    patterns: [
      { name: 'Wind Cold Damp', formulas: ['Juan Bi Tang', 'Gui Zhi Shao Yao Zhi Mu Tang'] },
      { name: 'Wind Heat', formulas: ['Bai Hu Jia Gui Zhi Tang'] },
      { name: 'Damp Heat', formulas: ['Xuan Bi Tang', 'Si Miao San'] },
      { name: 'Blood Stasis', formulas: ['Shen Tong Zhu Yu Tang', 'Huo Luo Xiao Ling Dan'] },
    ]
  },
  
  // 21. Beng Lou (Uterine Bleeding) - WITH PATTERNS
  { 
    name: 'Beng Lou (Uterine Bleeding)', 
    category: 'tcm',
    patterns: [
      { name: 'Spleen Qi Deficiency', formulas: ['Gui Pi Tang', 'Bu Zhong Yi Qi Tang'] },
      { name: 'Blood Heat', formulas: ['Qing Jing San', 'Bao Yin Jian'] },
      { name: 'Blood Stasis', formulas: ['Shi Xiao San', 'Shao Fu Zhu Yu Tang'] },
      { name: 'Kidney Yang Deficiency', formulas: ['You Gui Wan'] },
    ]
  },
  
  // 22. Lin Syndrome (Painful Urination) - WITH PATTERNS
  { 
    name: 'Lin Syndrome (Painful Urination)', 
    category: 'tcm',
    patterns: [
      { name: 'Damp Heat', formulas: ['Ba Zheng San', 'Long Dan Xie Gan Tang'] },
      { name: 'Stone Lin', formulas: ['Shi Wei San', 'San Jin Pai Shi Tang'] },
      { name: 'Qi Lin', formulas: ['Chen Xiang San', 'Shen Qi San'] },
      { name: 'Blood Lin', formulas: ['Xiao Ji Yin Zi', 'Dan Zhi Xiao Yao San'] },
    ]
  },
  
  // 23. Wei Syndrome (Atrophy) - WITH PATTERNS
  { 
    name: 'Wei Syndrome (Atrophy)', 
    category: 'tcm',
    patterns: [
      { name: 'Lung Heat', formulas: ['Qing Zao Jiu Fei Tang', 'Bai He Gu Jin Tang'] },
      { name: 'Damp Heat', formulas: ['Jia Wei Er Miao San', 'San Ren Tang'] },
      { name: 'Liver Kidney Deficiency', formulas: ['Hu Qian Wan', 'Da Bu Yin Wan'] },
    ]
  },
  
  // 24. Xiao Ke (Wasting-Thirst/Diabetes) - WITH PATTERNS
  { 
    name: 'Xiao Ke (Wasting-Thirst)', 
    category: 'tcm',
    patterns: [
      { name: 'Lung Heat', formulas: ['Xiao Ke Fang', 'Yu Ye Tang'] },
      { name: 'Stomach Heat', formulas: ['Yu Nu Jian', 'Bai Hu Tang'] },
      { name: 'Kidney Yin Deficiency', formulas: ['Liu Wei Di Huang Wan', 'Zhi Bai Di Huang Wan'] },
    ]
  },
  
  // 25. Yu Zheng (Depression) - WITH PATTERNS
  { 
    name: 'Yu Zheng (Depression)', 
    category: 'tcm',
    patterns: [
      { name: 'Liver Qi Stagnation', formulas: ['Xiao Yao San', 'Chai Hu Shu Gan San'] },
      { name: 'Qi Stagnation Transforming Fire', formulas: ['Dan Zhi Xiao Yao San', 'Jia Wei Xiao Yao San'] },
      { name: 'Heart Blood Deficiency', formulas: ['Gui Pi Tang', 'Yang Xin Tang'] },
    ]
  },
  
  // 26. Zhong Feng (Wind Strike/Stroke) - WITH PATTERNS
  { 
    name: 'Zhong Feng (Wind Strike)', 
    category: 'tcm',
    patterns: [
      { name: 'Liver Yang Rising', formulas: ['Tian Ma Gou Teng Yin', 'Zhen Gan Xi Feng Tang'] },
      { name: 'Phlegm Fire', formulas: ['Wen Dan Tang', 'Di Tan Tang'] },
      { name: 'Qi Deficiency Blood Stasis', formulas: ['Bu Yang Huan Wu Tang'] },
    ]
  },
  
].sort((a, b) => a.name.localeCompare(b.name));
