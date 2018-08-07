<?php 

    $songDirs = scandir('../../songs');

    $songs = array();

    foreach($songDirs as $songDir){
        
        if($songDir!='.' && $songDir!='..'){
            
            $songFiles = scandir('../../songs/'.$songDir);
        
            $files = array();

            foreach($songFiles as $songFile){  
                
                $extension = pathinfo('../../songs/'.$songDir.'/'.$songFile)['extension'];
                if($extension=='osu'){
                    
                    $fileContent = file_get_contents('../../songs/'.$songDir.'/'.$songFile);
                    $rows = explode("\n", $fileContent);
                    array_shift($rows);
                    $difficulty="";
                    
                    foreach($rows as $row => $data){
                        $row_data = explode(':', $data);
                        if($row_data[0]=='OverallDifficulty'){
                            $difficulty=intval($row_data[1]);
                            break;
                        }
                    }
                    
                    $file = array(
                        "songFile" => $songFile,
                        "difficulty" => $difficulty
                    );
                    
                    array_push($files, $file);
                }
                
            }

            $scale = array('easy.osu', 'normal.osu', 'hard.osu', 'oni.osu');
            usort($files, function ($a, $b) use ($scale) {
                $pos_a = array_search($a['songFile'], $scale);
                $pos_b = array_search($b['songFile'], $scale);
                return $pos_a - $pos_b;
            });
            
            $song = array(
                "songDir" => $songDir,
                "files" => $files
            );
                        
            array_push($songs, $song);
            
        }
        
    }

    echo json_encode($songs);

?>